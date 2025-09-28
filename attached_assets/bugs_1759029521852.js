'use strict';

////////////////////////////////////////////////////////////////////////
// Required modules
////////////////////////////////////////////////////////////////////////
var async = require('async');
var _ = require('lodash');
var crypto = require('crypto');
var Handlebars = require('handlebars');
var request = require('request');
var rp = require('request-promise');
var pdf = require('html-pdf');
var xss = require('xss');
var fs = require('fs');
var utility = require('./utility');
// var array = require('node-array');
//----------------------- export the module ---------------
var authorization = require('./authorization');
var commonFun = require('./commonfunction');
var responses = require('./response');
var dbHandler = require('./databaseHandler').dbHandler;
var logging = require('./logging');
var constants = require('./constants');
var programs = require('./programs');
var hackers = require('./hacker');
var mailer = require('./mailer');
var mailgun = require('mailgun-js');

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
  return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
});

const JiraIssueTemplate = Handlebars.compile("{ \"fields\": { \"issuetype\": { \"id\": \"10005\" }, \"project\": { \"key\": \"\" }, \"description\": { \"version\": 1, \"type\": \"doc\", \"content\": [ { \"type\": \"paragraph\", \"content\": [ { \"type\": \"text\", \"text\": \"CVSS Score: {{{bug.cvss_score}}}\" }, { \"type\": \"hardBreak\" }, { \"type\": \"text\", \"text\": \"CVSS vector: {{{bug.cvss_vector}}}\" } ] }, { \"type\": \"paragraph\", \"content\": [ { \"type\": \"text\", \"text\": \"Description:\", \"marks\": [ { \"type\": \"strong\" } ] } ] }, { \"type\": \"paragraph\", \"content\": [ { \"type\": \"text\", \"text\": \"{{{bug.bug_description}}}\" } ] }, { \"type\": \"paragraph\", \"content\": [ { \"type\": \"text\", \"text\": \"HTTP Request:\", \"marks\": [ { \"type\": \"strong\" } ] } ] }, { \"type\": \"paragraph\", \"content\": [ { \"type\": \"text\", \"text\": \"{{{bug.http_request}}}\" } ] }, { \"type\": \"paragraph\", \"content\": [ { \"type\": \"text\", \"text\": \"Steps to Reproduce:\", \"marks\": [ { \"type\": \"strong\" } ] } ] } {{#bug.steps_to_reproduce}} {{#ifEquals type \"text\"}} ,{ \"type\": \"paragraph\", \"content\": [ { \"type\": \"text\", \"text\": \"{{{data}}}\" } ] }{{/ifEquals}} {{#ifEquals type \"image\"}} ,{ \"type\": \"paragraph\", \"content\": [ { \"type\": \"text\", \"text\": \"{{{data}}}\", \"marks\": [ { \"type\": \"link\", \"attrs\": { \"href\": \"{{{data}}}\" } } ] } ] }{{/ifEquals}} {{/bug.steps_to_reproduce}} , { \"type\": \"paragraph\", \"content\": [ { \"type\": \"text\", \"text\": \"Fix Recommendation:\", \"marks\": [ { \"type\": \"strong\" } ] }, { \"type\": \"hardBreak\" }, { \"type\": \"text\", \"text\": \"{{{bug.suggested_fix}}}\" } ] }, { \"type\": \"paragraph\", \"content\": [ { \"type\": \"text\", \"text\": \"Impact\", \"marks\": [ { \"type\": \"strong\" } ] }, { \"type\": \"hardBreak\" }, { \"type\": \"text\", \"text\": \"{{{bug.bug_impact}}}\" } ] } ] }, \"summary\": \"{{{bug.bug_caption}}}\" } }");
const ReportTemplate = Handlebars.compile(
  `<!DOCTYPE html>
  <html lang="en">
  
  <head>
      <meta charset="UTF-8" />
      <link href="https://cdn.jsdelivr.net/npm/tailwindcss@4.0.17/index.min.css" rel="stylesheet" />
      <style>
      html {
          font-size: 14px;
          word-wrap: break-word;
      }
  
      body {
          font-family: 'Arial';
          line-height: 1.6;  
      }
  
      pre {
          font-family: 'Arial';
          overflow-x: auto;
          white-space: pre-wrap;
          white-space: -moz-pre-wrap;
          white-space: -pre-wrap;
          white-space: -o-pre-wrap;
          word-wrap: break-word;
          line-height: 1.6;
  
      }
  
      .footer-text {
          font-size: 10px;
          color: #666;
          display: inline-block;
      }
  
      .footer-link {
          font-size: 11px;
          color: #4299e1;
          font-weight: 500;
          display: inline-block;
      }
  
      .footer-image {
          width: 70px;
          opacity: 0.3;
      }
  
      .page {
          position: relative;
          /* Comment out this section to view in browser == Section Start ==*/
          /* min-height: 90mm; width: 50mm; */
          /*== Section End ==*/
          display: block;
          page-break-after: auto;
          margin: 15mm;
          margin-bottom: 10mm;
          overflow: hidden;
      }
  
      .flex {
          display: -webkit-box;
          display: -webkit-flex;
          display: flex;
      }
  
      .justify-start {
          -webkit-box-pack: start;
          -webkit-justify-content: flex-start;
          justify-content: flex-start;
      }
  
      .justify-end {
          -webkit-box-pack: end;
          -webkit-justify-content: flex-end;
          justify-content: flex-end;
      }
  
      .justify-center {
          -webkit-box-pack: center;
          -webkit-justify-content: center;
          justify-content: center;
      }
  
      .justify-between {
          -webkit-box-pack: justify;
          -webkit-justify-content: space-between;
          justify-content: space-between;
      }
  
      .justify-around {
          -webkit-justify-content: space-around;
          justify-content: space-around;
      }
  
      .justify-evenly {
          -webkit-box-pack: space-evenly;
          -webkit-justify-content: space-evenly;
          justify-content: space-evenly;
      }
  
      .items-start {
          -webkit-box-align: start;
          -webkit-align-items: flex-start;
          align-items: flex-start;
      }
  
      .items-end {
          -webkit-box-align: end;
          -webkit-align-items: flex-end;
          align-items: flex-end;
      }
  
      .items-center {
          -webkit-box-align: center;
          -webkit-align-items: center;
          align-items: center;
      }
      .critical {
        color: #CC0500;
      }
      .high{
        color: #DF3D03;
      }
      .medium {
        color: #F9A009;
      }
      .low {
        color: #ffcb0d;
      }
      .none{
        color: #53aa33;
      }
  
      .border-critical {
        border-color: #CC0500;
      }
      .border-high{
        border-color: #DF3D03;
      }
      .border-medium {
        border-color: #F9A009;
      }
      .border-low {
        border-color: #ffcb0d;
      }
      .border-none{
        border-color: #53aa33;
      }
  
      @media print {
          .page {
              margin: 0;
              min-height: 100%;
              width: 100%;
          }
      }
      </style>
      <title>Document</title>
  </head> <!-- 1. To start a new page, use a div with .page class 2.  To end the page and start next section from a new page, add <div style="page-break-after: always;"></div> at the end of the .page div 3. To start a fresh page after ending, add another div with .page class -->
  
  <body>
      <!-- Cover Page -->
      <div class="page">
          <div class="w-full mt-8 flex items-center">
              <div class="flex items-center" style="width: 160px;">




    <!-- Logo here: Needs to be uploded to server and stick url here --> <a href="https://appsecure.security"><img style="width: 150px;" src="http://127.0.0.1:1234/appsecure_logo.png" /></a> </div>

              <div class="w-full ml-4 items-center">
                  <p class="text-xl text-gray-900 font-medium">{{{report_title}}}</p>
              </div>
          </div>
          <div class="mt-16 leading-6 text-xs text-gray-700">
              <!-- URLs here --> {{#test_scope}} <p>{{.}}</p> {{/test_scope}} </div>
          <div class="w-full border border-b border-grey-200 mt-6"></div>
          <div>
              <div class="flex my-4 text-gray-700 text-xs">
                  <div class="w-1/2">
                      <h6 class="font-semibold text-gray-700">REPORT PUBLISH DATE</h6>
                  </div>
                  <div class="w-1/2">
                      <p class="font-semibold text-gray-700">{{{test_time}}}</p>
                  </div>
              </div>
          </div> {{#testers_exist}} <div class="w-full border border-b border-grey-200 mb-8"></div>
          <div class="w-full text-xs text-gray-700">
              <p class="font-semibold mb-3 text-gray-800">TEST PERFORMED BY</p> {{#testers}} <div class="flex justify-between my-2">
                  <p class="font-medium text-blue-500">{{name}}</p>
                  <p class="border border-grey-600 rounded px-1">{{role}}</p>
              </div> {{/testers}}
          </div> {{/testers_exist}} <div style="page-break-after: always;"></div>
      </div> <!-- Contents -->
      <div class="page">
          <h1 class="text-lg font-medium text-gray-900">Contents</h1>
          <div class="w-full border border-b border-grey-200 my-2"></div>
          <div class="text-xs text-gray-700">
              <div class="flex justify-between my-2">
                  <p>Executive Summary</p>
                  <p>3</p>
              </div>
              <div class="flex justify-between my-2">
                  <p>Security Checklist</p>
                  <p>4</p>
              </div>
              <div class="flex justify-between my-2">
                  <p>Scope of Work</p>
                  <p>7</p>
              </div>
              <div class="flex justify-between my-2">
                  <p>Methodology</p>
                  <p>9</p>
              </div>
              <div class="pl-4">
                  <div class="flex justify-between my-2">
                      <p>Pre Engagement</p>
                      <p>9</p>
                  </div>
                  <div class="flex justify-between my-2">
                      <p>Penetration Testing</p>
                      <p>9</p>
                  </div>
                  <div class="flex justify-between my-2">
                      <p>Post Engagement | 30 days time after Reporting (Reverification)</p>
                      <p>9</p>
                  </div>
                  <div class="flex justify-between my-2">
                      <p>Severity Ratings</p>
                      <p>10</p>
                  </div>
                  <div class="flex justify-between my-2">
                      <p>Severity Rating Scale</p>
                      <p>10</p>
                  </div>
              </div>
              <div class="flex justify-between my-2">
                  <p>Vulnerabilities Summary</p>
                  <p>11</p>
              </div>
              <div class="flex justify-between my-2">
                  <p>Appendix A - Vulnerability Summary & Recommendations</p>
                  <p>12</p>
              </div>
          </div>
          <div style="page-break-after: always;"></div>
      </div> <!-- Executive Summary Page -->
      <div class="page text-gray-700 text-sm font-light">
          <h1 class="text-lg font-medium text-gray-900">Executive Summary</h1>
          <div class="w-full border border-b border-grey-200 my-2"></div>
          <p class="pt-2" style="word-wrap: break-word;">
              <pre>{{{executive_summary}}}</pre>
          </p>
          <div style="page-break-after: always;"></div>
      </div><!-- Security Checkist Page -->
      <div class="page text-gray-700 text-sm font-light ">
          <h1 class="text-lg font-medium text-gray-900">Security Checklist</h1>
          <div class="w-full border border-b border-grey-200 my-2"></div>
              <table class="table-auto border mb-8 text-xs" style="border-radius:10px" width="100%" >
                  <thead>
                    <tr>
                      <th class="px-4 py-2 border text-left text-black" colspan="2" style="background-color: #dde7ea;">1. Identity Management Testing</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border px-4 py-2" width="50%">1.1 Test Role Definitions</td>
                      <td class="border px-4 py-2">1.2 Test User Registration Process</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">1.3 Test Account Provisioning Process</td>
                      <td class="border px-4 py-2">1.4 Testing for Account Enumeration and Guessable User Account</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">1.5 Testing for Weak or Unenforced Username Policy</td>
                      <td class="border px-4 py-2"></td>
                    </tr>
                  </tbody>
              </table>
  
                <table class="table-auto border mb-8 text-xs" style="border-radius:10px" width="100%" >
                  <thead>
                    <tr>
                      <th class="px-4 py-2 border text-left text-black" colspan="2" style="background-color: #dde7ea;">2. Authentication Testing</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border px-4 py-2" width="50%">2.1 Testing for Credentials Transported over an Encrypted Channel</td>
                      <td class="border px-4 py-2">2.2 Testing for Default Credentials</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">2.3 Testing for Weak Lock Out Mechanism</td>
                      <td class="border px-4 py-2">2.4 Testing for Bypassing Authentication Schema</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">2.5 Testing for Vulnerable Remember Password</td>
                      <td class="border px-4 py-2">2.6 Testing for Browser Cache Weaknesses</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">2.7 Testing for Weak Password Policy</td>
                      <td class="border px-4 py-2">2.8 Testing for Weak Security Question Answer</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">2.9 Testing for Weak Password Change or Reset Functionalities</td>
                      <td class="border px-4 py-2">2.10 Testing for Weaker Authentication in Alternative Channel</td>
                    </tr>
                  </tbody>
                </table>
  
                <table class="table-auto border mb-8 text-xs" style="border-radius:10px" width="100%" >
                  <thead>
                    <tr>
                      <th class="px-4 py-2 border text-left text-black" colspan="2" style="background-color: #dde7ea;">3. Authorization Testing</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border px-4 py-2" width="50%">3.1 Testing Directory Traversal File Include</td>
                      <td class="border px-4 py-2">3.2 Testing for Bypassing Authorization Schema</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">3.3 Testing for Privilege Escalation</td>
                      <td class="border px-4 py-2">3.4 Testing for Insecure Direct Object References</td>
                    </tr>
                  </tbody>
                </table>
  
                <table class="table-auto border mb-8 text-xs" style="border-radius:10px;page-break-inside: avoid;" width="100%" > 
                  <thead>
                    <tr>
                      <th class="px-4 py-2 border text-left text-black" colspan="2" style="background-color: #dde7ea;">4. Session Management Testing</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border px-4 py-2" width="50%">4.1 Testing for Session Management Schema</td>
                      <td class="border px-4 py-2">4.2 Testing for Cookies Attributes</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">4.3 Testing for Session Fixation</td>
                      <td class="border px-4 py-2">4.4 Testing for Exposed Session Variables</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">4.5 Testing for Cross Site Request Forgery</td>
                      <td class="border px-4 py-2">4.6 Testing for Logout Functionality</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">4.7 Testing Session Timeout</td>
                      <td class="border px-4 py-2">4.8 Testing for Session Puzzling</td>
                    </tr>
                  </tbody>
                </table>
  
                <table class="table-auto border mb-8 text-xs" style="border-radius:10px" width="100%" >
                  <thead>
                    <tr>
                      <th class="px-4 py-2 border text-left text-black" colspan="2" style="background-color: #dde7ea;">5. Input Validation Testing</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border px-4 py-2" width="50%">5.1 Testing for Reflected Cross Site Scripting</td>
                      <td class="border px-4 py-2">5.2 Testing for Stored Cross Site Scripting</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">5.3 Testing for HTTP Verb Tampering</td>
                      <td class="border px-4 py-2">5.4 Testing for HTTP Parameter Pollution</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">5.5 Testing for SQL Injection</td>
                      <td class="border px-4 py-2">5.6 Testing for LDAP Injection</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">5.7 Testing for XML Injection</td>
                      <td class="border px-4 py-2">5.8 Testing for SSI Injection</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2" width="50%">5.9 Testing for XPath Injection</td>
                      <td class="border px-4 py-2">5.10 Testing for IMAP SMTP Injection</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">5.11 Testing for Code Injection</td>
                      <td class="border px-4 py-2">5.12 Testing for Command Injection</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">5.13 Testing for Buffer Overflow</td>
                      <td class="border px-4 py-2">5.14 Testing for Incubated Vulnerability</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">5.15 Testing for HTTP Splitting Smuggling</td>
                      <td class="border px-4 py-2">5.16 Testing for HTTP Incoming Requests</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">5.17 Testing for Host Header Injection</td>
                      <td class="border px-4 py-2">5.18 Testing for Server Side Template Injection</td>
                    </tr>
                  </tbody>
                </table>
  
                <table class="table-auto border mb-8 text-xs" style="border-radius:10px" width="100%" >
                  <thead>
                    <tr>
                      <th class="px-4 py-2 border text-left text-black" colspan="2" style="background-color: #dde7ea;">6. Testing for Error Handling</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border px-4 py-2" width="50%">6.1 Testing for Error Code</td>
                      <td class="border px-4 py-2">6.2 Testing for Stack Traces</td>
                    </tr>
                  </tbody>
                </table>
  
                <table class="table-auto border mb-8 text-xs" style="border-radius:10px;page-break-inside: avoid;" width="100%" >
                  <thead>
                    <tr>
                      <th class="px-4 py-2 border text-left text-black" colspan="2" style="background-color: #dde7ea;">7. Testing for Weak Cryptography</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border px-4 py-2" width="50%">7.1 Testing for Weak SSL TLS Ciphers Insufficient Transport Layer Protection</td>
                      <td class="border px-4 py-2">7.2 Testing for Padding Oracle</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">7.3 Testing for Sensitive Information Sent via Unencrypted Channels</td>
                      <td class="border px-4 py-2">7.4 Testing for Weak Encryption</td>
                    </tr>
                  </tbody>
                </table>
  
                <table class="table-auto border mb-8 text-xs" style="border-radius:10px" width="100%" > 
                  <thead>
                    <tr>
                      <th class="px-4 py-2 border text-left text-black" colspan="2" style="background-color: #dde7ea;">8. Business Logic Testing</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border px-4 py-2" width="50%">8.1 Introduction to Business Logic</td>
                      <td class="border px-4 py-2">8.2 Test Business Logic Data Validation</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">8.3 Test Ability to Forge Requests</td>
                      <td class="border px-4 py-2">8.4 Test Integrity Checks</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">8.5 Test for Process Timing</td>
                      <td class="border px-4 py-2">8.6 Test Number of Times a Function Can Be Used Limits</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">8.7 Testing for the Circumvention of Work Flows</td>
                      <td class="border px-4 py-2">8.8 Test Defenses Against Application Misuse</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">8.9 Test Upload of Unexpected File Types</td>
                      <td class="border px-4 py-2">8.10 Test Upload of Malicious Files</td>
                    </tr>
                  </tbody>
                </table>
  
                <table class="table-auto border mb-8 text-xs" style="border-radius:10px" width="100%" > 
                  <thead>
                    <tr>
                      <th class="px-4 py-2 border text-left text-black" colspan="2" style="background-color: #dde7ea;">9. Client Side Testing</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td class="border px-4 py-2" width="50%">9.1 Testing for DOM Based Cross Site Scripting</td>
                      <td class="border px-4 py-2">9.2 Testing for JavaScript Execution</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">9.3 Testing for HTML Injection</td>
                      <td class="border px-4 py-2">9.4 Testing for Client Side URL Redirect</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">9.5 Testing for CSS Injection</td>
                      <td class="border px-4 py-2">9.6 Testing for Client Side Resource Manipulation</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">9.7 Testing Cross Origin Resource Sharing</td>
                      <td class="border px-4 py-2">9.8 Testing for Cross Site Flashing</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">9.9 Testing for Clickjacking</td>
                      <td class="border px-4 py-2">9.10 Testing WebSockets</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">9.11 Testing Web Messaging</td>
                      <td class="border px-4 py-2">9.12 Testing Browser Storage</td>
                    </tr>
                    <tr>
                      <td class="border px-4 py-2">9.13 Testing for Cross Site Script Inclusion</td>
                      <td class="border px-4 py-2"></td>
                    </tr>
                  </tbody>
                </table>
  
          <div style="page-break-after: always;"></div>
      </div> 
      <!-- Scope of Work Page 1 -->
      <div class="page text-gray-700 text-sm font-light">
          <h1 class="text-lg font-medium text-gray-900">Scope of Work</h1>
          <div class="w-full border border-b border-grey-200 my-2"></div>
          <h1 class="text-base font-medium text-gray-800 py-4">Coverage</h1>
          <p> This penetration test was a manual assessment of the security of the app’s functionality, business logic, and vulnerabilities such as those cataloged in the OWASP Top 10. The assessment also included a review of security controls and requirements listed in the OWASP Application Security Verification Standard (ASVS). The researchers rely on tools to facilitate their work, but the majority of the assessment involves manual analysis. </p> <br />
          <p> The following is a quick summary of the main tests performed on the {{{coverage_asset_type}}}: </p>
          <li class="my-1"> Authenticated user testing for session and authentication issues </li>
          <li class="my-1"> Authorization testing for privilege escalation and access control issues </li>
          <li class="my-1"> Input injection tests (SQL injection, XSS, and others) </li>
          <li class="my-1">Platform configuration and infrastructure tests</li>
          <li class="my-1">OWASP Top 10 Assessment</li>
          <p> The team had access to authenticated users, enabling them to test security controls across roles and permissions.</p>
          <div style="page-break-after: always;"></div>
      </div> <!--  Scop of Work Page 2 -->
      <div class="page text-gray-700 text-sm font-light">
          <h1 class="text-base font-medium text-gray-800 py-4"> Target description </h1>
          <p class="mb-3"> The following URLs/apps were in scope for this assessment: </p> {{#test_scope}} <li class="my-2">{{.}}</li> {{/test_scope}} <h1 class="text-base font-medium text-gray-800 py-4"> Assumptions/Constraints </h1>
          <p style="word-wrap: break-word;">
              <pre>{{{assumptions}}}</pre>
          </p>
          <div style="page-break-after: always;"></div>
      </div> <!-- Methodology Page 2 -->
      <div class="page text-gray-700 text-sm font-light">
          <h1 class="text-lg font-medium text-gray-900">Methodology</h1>
          <div class="w-full border border-b border-grey-200 my-2"></div>
          <p> The test was done according to penetration testing best practices. The flow from start to finish is listed below. </p>
          <div class="my-4 pl-3">
              <p class="font-medium text-gray-800">Pre Engagement</p>
              <div class="pl-4 text-xs">
                  <li class="my-2">Scoping</li>
                  <li class="my-2">Discovery</li>
              </div>
          </div>
          <div class="my-4 pl-3">
              <p class="font-medium text-gray-800">Penetration Testing</p>
              <div class="pl-4 text-xs">
                  <li class="my-2">Tool assisted assessment</li>
                  <li class="my-2"> Manual assessment of OWASP top 10/SANS top 25 & business logic flaws </li>
                  <li class="my-2">Exploitation</li>
                  <li class="my-2">Risk analysis</li>
                  <li class="my-2">Reporting</li>
              </div>
          </div>
          <div class="my-4 pl-3">
              <p class="font-medium text-gray-800">Post Engagement</p>
              <div class="pl-4 text-xs">
                  <li class="my-2">Best practice support</li>
                  <li class="my-2">Re-testing</li>
              </div>
          </div>
          <div style="page-break-after: always;"></div>
      </div> <!-- Methodology Page 2 -->
      <div class="page text-gray-700 text-sm font-light">
          <h2 class="text-base text-gray-800 font-medium mb-1">Severity Ratings</h2>
          <p class="pb-5"> The Common Vulnerability Scoring System (CVSS) v3.0 is a framework for rating the severity of security vulnerabilities in software. Operated by the Forum of Incident Response and Security Teams (FIRST), the CVSS uses an algorithm to determine three severity rating scores: Base, Temporal and Environmental. The scores are numeric; they range from 0.0 through 10.0 with 10.0 being the most severe. </p>
          <p class="pb-5"> CVSS is composed of three metric groups, Base, Temporal, and Environmental, each consisting of a set of metrics, as shown in below figure. </p>
          <div class="flex justify-center">
            <img style="width: 450px;" src="http://127.0.0.1:1234/severity1.png" />
          </div>

      </div> <!-- Methodology Page 3 -->
      <div class="page text-gray-700 text-sm font-light">
          <br/><br/>
          <h2 class="text-base text-gray-800 font-medium mb-1"> Severity Rating Scale </h2>

          <p class="pb-5"> Findings are grouped into four criticality levels based on their risk.</p>
          <div class="flex justify-center">
            <img style="width: 450px;" src="http://127.0.0.1:1234/severity2.png" />
          </div>
          <div style="page-break-after: always;"></div>
      </div>
      <div class="page text-gray-700 text-sm font-light">
          <h1 class="text-lg font-medium text-gray-900">Vulnerabilities Summary</h1>
          <div class="table w-full">
              <div class="table-row-group">
                  <div class="table-row text-xs" style="background-color: #dde7ea;">
                      <div class="table-cell text-gray-800 px-2 pl-4 py-4"> S.NO. </div>
                      <div class="table-cell text-gray-800 px-2 pl-4 py-4"> VULNERABILITY TITLE </div>
                      <div class="table-cell text-gray-800 px-2 py-5 text-center"> IMPACT </div>
                      <div class="table-cell text-gray-800 px-2 py-5 text-center"> STATE </div>
		 <!-- <div class="table-cell text-gray-800 px-2 py-5 text-center"> RELATED TO PII </div> -->
		      
                  </div> <!-- Snippet to be used: Start--> {{#bugs}} <div class="table-row bg-gray-100" style="background-color:rgb(247, 250, 252);">
                      <div class="table-cell text-blue-500 px-2 pl-4 py-5"> {{index}} </div>
                      <div class="table-cell text-blue-500 px-2 pl-4 py-5"> {{bug_caption}} </div>
                      <div class="table-cell text-gray-800 px-2 py-5 text-center {{#isCriticalSeverity}}critical{{/isCriticalSeverity}} {{#isHighSeverity}}high{{/isHighSeverity}} {{#isMediumSeverity}}medium{{/isMediumSeverity}} {{#isLowSeverity}}low{{/isLowSeverity}} {{#isNoneSeverity}}none{{/isNoneSeverity}}"> {{severity}} </div>
                      <div class="table-cell text-gray-800 px-2 py-5 text-center"> {{status}} </div>
		<!-- <div class="table-cell text-gray-800 px-2 py-5 text-center"> No </div> -->
                  </div> {{/bugs}}
              </div>
          </div>
          <div style="page-break-after: always;"></div>
      </div> <!-- Appendid Page -->
      <div class="page text-gray-700 text-sm font-light">
          <h1 class="text-lg font-medium text-gray-900"> Appendix A - Vulnerability Summary & Recommendations </h1> {{#bugs}}
          <!-- Snippet for each Bug appendix: Start -->
          <div class="flex items-center w-full my-2 pb-3 border-b-2 border-gray-200">
              <div class="w-5/6">
                  <h1 class="text-sm font-medium text-gray-800" style="word-wrap: break-word;"> <span class="text-xs text-gray-700 font-normal">#{{index}} </span>{{{bug_caption}}} </h1>
                  <div class="flex items-center my-2 font-medium" style="font-size: 10px;"><span class="{{#isCriticalSeverity}}critical{{/isCriticalSeverity}} {{#isHighSeverity}}high{{/isHighSeverity}} {{#isMediumSeverity}}medium{{/isMediumSeverity}} {{#isLowSeverity}}low{{/isLowSeverity}} {{#isNoneSeverity}}none{{/isNoneSeverity}} border {{#isCriticalSeverity}}border-critical{{/isCriticalSeverity}} {{#isHighSeverity}}border-high{{/isHighSeverity}} {{#isMediumSeverity}}border-medium{{/isMediumSeverity}} {{#isLowSeverity}}border-low{{/isLowSeverity}} {{#isNoneSeverity}}border-none{{/isNoneSeverity}} px-2 rounded box-border">{{{severity}}}</span>
                      <p class="pl-2 text-gray-700">{{{bug_type}}}</p>
                  </div>
                  {{#if cvss_score}}<div class="flex items-center my-2 font-medium" style="font-size: 10px;">
                      <p class="pl-2 text-gray-700">CVSS Score: {{{cvss_score}}}</p>
                  </div>{{/if}}
                  {{#if cvss_vector}}<div class="flex items-center my-2 font-medium" style="font-size: 10px;">
                      <p class="pl-2 text-gray-700">CVSS Vector: {{{cvss_vector}}}</p>
                  </div>{{/if}}
              </div>
          </div>
          <div class="flex w-full my-6 pb-3 border-b-2 border-gray-200 text-xs">
              <div class="w-1/6 text-xs mr-2 text-gray-700">DESCRIPTION</div>
              <div class="w-5/6 pl-2 break-words text-xs" style="word-wrap: break-word;">
                  <pre>{{bug_description}}</pre>
              </div>
          </div>
          <div class="flex w-full my-6 pb-3 border-b-2 border-gray-200 text-xs">
              <div class="w-1/6 text-xs mr-2 text-gray-700">STEPS TO REPRODUCE</div>
              <div class="w-5/6 pl-2 break-words text-xs" style="word-wrap: break-word;">
              \t  {{#steps_to_reproduce}}{{#ifEquals type "text"}}<pre>{{data}}</pre>{{/ifEquals}}{{#ifEquals type "image"}}<img style="width: 450px;" src="{{{data}}}" />{{/ifEquals}}{{/steps_to_reproduce}}
              </div>
          </div>
          {{#if containsScreenshot}}
          <div class="flex w-full my-6 pb-3 border-b-2 border-gray-200 text-xs" style="page-break-inside: avoid;">
             <div class="w-1/6 text-xs mr-2 text-gray-700">SCREENSHOTS</div>
             <div class="w-5/6 pl-2 break-words text-xs" style="word-wrap: break-word;">
                 {{#each screenshots}}
                 <img style="max-height: 100vh; width: auto; max-width: 100%; height: auto;" src="{{.}}" /><br>
                 {{/each}}
             </div>
          </div>
          {{/if}}
          <div class="flex w-full my-6 pb-3 border-b-2 border-gray-200 text-xs">
              <div class="w-1/6 text-xs mr-2 text-gray-700">IMPACT</div>
              <div class="w-5/6 pl-2 break-words text-xs" style="word-wrap: break-word;">
                  <pre>{{bug_impact}}</pre>
              </div>
          </div>
          <div class="flex w-full my-6 pb-3 border-b-2 border-gray-200 text-xs" style="page-break-inside: avoid;">
              <div class="w-1/6 text-xs mr-2 text-gray-700">HTTP REQUEST</div>
              <div class="w-5/6 p-2 break-words text-xs" style="background-color: rgb(237, 242, 247);">
                  <pre> {{http_request}} </pre>
              </div>
          </div>
          <div class="flex w-full my-6 pb-3 border-b-2 border-gray-200 text-xs">
              <div class="w-1/6 text-xs mr-2 text-gray-700">SUGGESTED FIX</div>
              <div class="w-5/6 pl-2 break-words text-xs" style="word-wrap: break-word;">
                  <pre>{{suggested_fix}}</pre>
              </div>
          </div><!-- Snippet to be used: End-->
          <div style="page-break-after: always;"></div> {{/bugs}}
      </div>
  </body>
  
  </html>`
);

exports.reportBug = reportBug;
exports.getBugs = getBugs;
exports.getBugsReport = getBugsReport;
exports.getComments = getComments;
exports.postComments = postComments;
exports.postStatus = postStatus;
exports.updateBug = updateBug;
exports.deleteBugHandler = deleteBugHandler;
exports.moveToJira = moveToJira;
exports.checkIfProgramExistsForHacker = checkIfProgramExistsForHacker;
exports.checkIfProgramExistsForHackerByHandle = checkIfProgramExistsForHackerByHandle;
//exports.webScrapper     =   webScrapper;
exports.totalreward = totalreward;
exports.totalRewardThisMonth = totalRewardThisMonth;
exports.activeBugs = activeBugs;
exports.resolvedBugs = resolvedBugs;
exports.totalAwardedBugs = totalAwardedBugs;
exports.totalClosedBugs = totalClosedBugs;
exports.totalTriagedBugs = totalTriagedBugs;
exports.topAwardedBug = topAwardedBug;
exports.relatedUsersWithBug = relatedUsersWithBug;
exports.changeCommentStatus = changeCommentStatus;
exports.getEmailIdForSendingMail = getEmailIdForSendingMail;
exports.reportAnonymousBug = reportAnonymousBug;

function reportBug(req, res) {
  var handlerInfo = {
    apiModule: 'bugs',
    apiHandler: 'reportBug',
  };

  var authToken = req.headers.auth_token;
  var userId = req.headers.user_id;
  var program_uuid = req.body.program_id;
  var bug_caption = req.body.bug_caption;
  var bug_description = req.body.bug_description;
  var steps_to_reproduce = req.body.steps_to_reproduce;
  var severity = xss(req.body.severity);
  var suggested_fix = req.body.suggested_fix;
  var http_request = req.body.http_request;
  var bug_impact = req.body.bug_impact;
  var bug_type = req.body.bug_type;
  var cvss_score = xss(req.body.cvss_score);
  var cvss_vector = req.body.cvss_vector;
  var screenshots = req.body.screenshots
    ? JSON.stringify(req.body.screenshots)
    : '[]';
  var agree_to_terms = parseInt(xss(req.body.agree_to_terms));

  var manvalues = [
    authToken,
    userId,
    program_uuid,
    bug_caption,
    bug_description,
    steps_to_reproduce,
    severity,
    suggested_fix,
    http_request,
    bug_impact,
    bug_type,
    agree_to_terms,
  ];
  var checkblank = commonFun.checkBlank(manvalues);

  if (checkblank) {
    return responses.sendParameterMissingResponse(handlerInfo, res);
  }

  if (!agree_to_terms) {
    return responses.sendAgreeToTermsResponse(handlerInfo, res);
  }

  if (
    commonFun.specialCharacterCheck(authToken) ||
    commonFun.specialCharacterCheck(userId) ||
    commonFun.specialCharacterCheck(program_uuid)
  ) {
    return responses.sendHackerJoiningResponse(handlerInfo, res);
  }

  authorization.validateAccessToken(handlerInfo, authToken, userId, function (
    err,
    user
  ) {
    if (err) {
      if (err.flag == constants.responseFlags.PENDING_VERIFICATION) {
        return responses.sendPendingVerificationResponse(handlerInfo, res);
      }
      if (err.flag == constants.responseFlags.ACCOUNT_SUSPENDED) {
        return responses.sendAccountSuspendedResponse(handlerInfo, res);
      }
      return responses.sendAuthenticationFailure(handlerInfo, res);
    }
    if (user.userRole != constants.userRole.HACKER) {
      return responses.sendUnauthorizedAccessResponse(handlerInfo, res);
    }

    var tasks = [
      checkIfProgramIsActive.bind(null, handlerInfo, program_uuid),
      checkIfProgramExistsForHacker.bind(
        null,
        handlerInfo,
        user.details.hacker_id
      ),
      insertBug.bind(
        null,
        handlerInfo,
        user.details.hacker_id,
        bug_caption,
        bug_description,
        steps_to_reproduce,
        severity,
        cvss_score,
        cvss_vector,
        screenshots,
        suggested_fix,
        http_request,
        bug_impact,
        bug_type,
        user.details.alias,
        user.details.profile_image,
        0
      ),
      sendMailForCreatedBug.bind(
        null,
        handlerInfo,
        user.details.alias,
        user.details.email_id,
        bug_caption
      ),
    ];

    async.waterfall(tasks, function (err, data) {
      if (err) {
        console.log("Failed to post the bug", err);
        return responses.sendFailureResponse(
          handlerInfo,
          res,
          'Failed to post the bug :' + (err.message ? err.message : ''),
          err
        );
      }
      responses.sendSuccessResponse(
        handlerInfo,
        res,
        'You have successfully posted the bug',
        { Bug_id: data }
      );
      // sendMailForCreatedBug(handlerInfo, bug_caption, user.details.alias, user.details.email_id, bug_caption, program_id, data[2], function(){
      // });
      // responses.sendSuccessResponse(handlerInfo, res, 'You have successfully posted the bug', {Bug_id : data[2]});
    });
  });
}

function checkIfProgramIsActive(handlerInfo, programUuid, callback) {
  var sql =
    'SELECT program_id FROM programs WHERE program_uuid = ? AND status = ?';

  var values = [programUuid, 'ACTIVE'];
  var sqlQuery = dbHandler
    .getInstance()
    .executeQuery(sql, values, function (err, active) {
      // logging.logDatabaseQuery(handlerInfo, 'checking if program is still active', err, active, sqlQuery.sql);
      if (err || !active.length) {
        return callback(new Error('This program is no more active'));
      }
      var programId = active[0].program_id;
      callback(null, programId);
    });
}

function checkIfProgramExistsForHacker(
  handlerInfo,
  hackerId,
  programId,
  callback
) {
  var getPrograms =
    'SELECT 1  ' +
    'FROM hacker_program_mapping ' +
    'WHERE hacker_id = ? ' +
    'AND program_id = ?';

  var getProgramsQuery = dbHandler
    .getInstance()
    .executeQuery(getPrograms, [hackerId, programId], function (err, programs) {
      // logging.logDatabaseQuery(handlerInfo, 'fetching hacker specific programs', err, programs, getProgramsQuery.sql);
      if (err || !programs.length) {
        // return callback(new Error("You are not authorised to access this program"));
        var getPrograms1 =
          'INSERT into hacker_program_mapping ' +
          '(hacker_id, program_id, status) VALUES (?,?, ?)';

        var getProgramsQuery1 = dbHandler
          .getInstance()
          .executeQuery(
            getPrograms1,
            [hackerId, programId, 'ACTIVE'],
            function (err1, programs1) {
              if (err1) {
                return callback(
                  new Error(
                    'Failed to create relation between hacker and the program'
                  )
                );
              }
              return callback(null, programId);
            }
          );
      }
      callback(null, programId);
    });
}

function checkIfProgramExistsForHackerByHandle(
  handlerInfo,
  hackerId,
  programHandle,
  callback
) {
  var getPrograms =
    'SELECT 1 FROM hacker_program_mapping h, programs p WHERE h.hacker_id = ? ' +
    'AND h.program_id = p.program_id AND p.program_handle = ?';

  var getProgramsQuery = dbHandler
    .getInstance()
    .executeQuery(getPrograms, [hackerId, programHandle], function (
      err,
      programs
    ) {
      // logging.logDatabaseQuery(handlerInfo, 'fetching hacker specific programs', err, programs, getProgramsQuery.sql);
      if (err || !programs.length) {
        return callback(
          new Error('You are not authorised to access this program')
        );
      }
      callback();
    });
}

function insertBug(
  handlerInfo,
  hackerId,
  bugCaption,
  bugDescription,
  steps_to_reproduce,
  severity,
  cvss_score,
  cvss_vector,
  screenshots,
  suggested_fix,
  http_request,
  bug_impact,
  bugType,
  alias,
  profile_image,
  is_anonymous,
  programId,
  callback
) {
  var bugUuid = crypto.pseudoRandomBytes(32).toString('hex');
  var sql =
    'INSERT INTO bugs ' +
    '(program_id, hacker_id, bug_caption, bug_description, steps_to_reproduce, severity, cvss_score, cvss_vector, screenshots, suggested_fix, http_request, bug_impact, bug_type, created_by, ' +
    'bug_uuid, status, hacker_alias, hacker_profile_image, is_anonymous) ' +
    'VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

  var values = [
    programId,
    hackerId,
    bugCaption,
    bugDescription,
    steps_to_reproduce,
    severity,
    cvss_score,
    cvss_vector,
    screenshots,
    suggested_fix,
    http_request,
    bug_impact,
    bugType,
    alias,
    bugUuid,
    'NEW_SUBMISSION',
    alias,
    profile_image,
    is_anonymous,
  ];

  var sqlQuery = dbHandler
    .getInstance()
    .executeQuery(sql, values, function (err, bug) {
      if (err) {
        return callback(new Error('Failed to report the bug'));
      }
      //The bugUuid generated above is saved in the db and is returned.
      //console.log("insertBug : ", programId, "bug ID : ", bugUuid);
      callback(null, bugUuid, programId);
    });
}

function sendMailForCreatedBug(
  handlerInfo,
  hackerAlias,
  emailidval,
  bugcaption,
  bugUuid,
  programId,
  callback
) {
  getEmailIdForSendingMail(
    handlerInfo,
    constants.userRole.PROGRAM_MEMBER,
    bugUuid,
    programId,
    function (err, emails) {
      var opts = {
        to: emails[0],
        text:
          'Hi,' +
          '<br><br> A new vulnerability has been reported :' +
          '<b>' +
          bugcaption +
          ' </b>by a security researcher. Please take a look here <br><br> http://139.59.6.20/#/company/bug/' +
          bugUuid +
          '<br><br> Thanks,<br><br> hackerhive.io',
        subject: '[HackerHive.io] ' + bugcaption,
      };
      mailer.sendMail(opts, function (err) {
        if (err) {
          console.log('sendMailForCreatedBug : ', err);
          return callback(err);
        }
        callback(null, bugUuid);
      });
    }
  );
}

function getEmailIdForSendingMail(
  handlerInfo,
  userType,
  bugId,
  programId,
  callback
) {
  if (userType == constants.userRole.HACKER) {
    // when user is program member then send the emails to hacker + all active program members
    //   var emailList = [];
    var tasks = [
      getHackerEmails.bind(null, handlerInfo, bugId),
      getMemberEmails.bind(null, handlerInfo, programId),
    ];
    async.waterfall(tasks, function (err, email) {
      if (err) {
        // return responses.sendFailureResponse(handlerInfo, res, 'Failed to fetch emails', err);
        return callback(err);
      }
      callback(null, email);
    });
  } else if (userType == constants.userRole.PROGRAM_MEMBER) {
    var emailList = [];
    var tasks = [getMemberEmails.bind(null, handlerInfo, programId, emailList)];
    async.series(tasks, function (err, email) {
      if (err) {
        // return responses.sendFailureResponse(handlerInfo, res, 'Failed to fetch emails', err);
        return callback(err);
      }
      callback(null, emailList);
    });
  }
}

function getHackerEmails(handlerInfo, bugId, callback) {
  var sql =
    'SELECT h.email_id ' +
    'FROM hackers h, bugs b ' +
    'WHERE b.hacker_id = h.hacker_id ' +
    'AND b.bug_uuid = ? AND h.status = "ACTIVE"';

  var values = [bugId];
  var sqlQuery = dbHandler
    .getInstance()
    .executeQuery(sql, values, function (err, active) {
      if (err) {
        return callback(new Error('no hacker email exists for this bug'));
      }
      var emailList = [];
      if (!active.length) {
        return callback(null, emailList);
      }
      var hackerEmails = [];
      hackerEmails.push(active[0].email_id);
      emailList.push(hackerEmails);
      callback(null, emailList);
    });
}

function getMemberEmails(handlerInfo, programId, emailList, callback) {
  var sql =
    'SELECT email_id FROM program_members ' +
    'WHERE program_id = ? AND status = "ACTIVE"';

  var values = [programId];
  var sqlQuery = dbHandler
    .getInstance()
    .executeQuery(sql, values, function (err, active1) {
      if (err) {
        return callback(new Error('Invalid program Id'));
      }
      if (!active1.length) {
        return callback(null, emailList);
      }
      var memberEmails = [];

      active1.forEach(function (user) {
        memberEmails.push(user.email_id);
      });

      emailList.push(memberEmails);
      callback(null, emailList);
    });
}

function getBugs(req, res) {
  var handlerInfo = {
    apiModule: 'bugs',
    apiHandler: 'getBugs',
  };

  var authToken = req.headers.auth_token;
  var userId = req.headers.user_id;

  var manvalues = [authToken, userId];
  var checkblank = commonFun.checkBlank(manvalues);

  if (checkblank) {
    return responses.sendParameterMissingResponse(handlerInfo, res);
  }

  if (
    commonFun.specialCharacterCheck(authToken) ||
    commonFun.specialCharacterCheck(userId)
  ) {
    return responses.sendHackerJoiningResponse(handlerInfo, res);
  }

  authorization.validateAccessToken(handlerInfo, authToken, userId, function (
    err,
    user
  ) {
    if (err) {
      if (err.flag == constants.responseFlags.PENDING_VERIFICATION) {
        return responses.sendPendingVerificationResponse(handlerInfo, res);
      }
      if (err.flag == constants.responseFlags.ACCOUNT_SUSPENDED) {
        return responses.sendAccountSuspendedResponse(handlerInfo, res);
      }
      return responses.sendAuthenticationFailure(handlerInfo, res);
    }

    var tasks = [];
    //if he is a program member
    if (!user.userRole) {
      tasks.push(
        getProgramMemberSubmittedBugs.bind(
          null,
          handlerInfo,
          user.details.program_member_id
        )
      );
    } else {
      tasks.push(
        getHackerSubmittedBugs.bind(
          null,
          handlerInfo,
          user.details.hacker_id,
          user.details.email_id
        )
      );
    }
    async.parallel(tasks, function (err, bugs) {
      if (err) {
        return responses.sendFailureResponse(
          handlerInfo,
          res,
          'Failed to fetch bugs',
          err
        );
      }
      responses.sendSuccessResponse(handlerInfo, res, 'bug details', bugs[0]);
    });
  });
}

function getBugsReport(req, res) {
  var handlerInfo = {
    apiModule: 'bugs',
    apiHandler: 'getBugs',
  };

  req.body.testers_exist = !_.isEmpty(req.body.testers);

  var authToken = req.headers.auth_token;
  var userId = req.headers.user_id;
  var report_title = req.body.report_title;
  var company_name = req.body.company_name;
  var application_name = req.body.application_name;
  var asset_type = req.body.asset_type || "web";
  var executive_summary = req.body.executive_summary ? Handlebars.compile(req.body.executive_summary)({
    company_name: company_name,
    application_name: application_name,
    asset_type: constants.assetTypeExecutiveSummaryMapping[asset_type]
  }) : "";
  var assumptions = req.body.assumptions;

  var manvalues = [
    authToken,
    userId,
    report_title,
    executive_summary,
    assumptions,
  ];
  var checkblank = commonFun.checkBlank(manvalues);

  if (checkblank) {
    return responses.sendParameterMissingResponse(handlerInfo, res);
  }

  if (
    commonFun.specialCharacterCheck(authToken) ||
    commonFun.specialCharacterCheck(userId)
  ) {
    return responses.sendHackerJoiningResponse(handlerInfo, res);
  }

  authorization.validateAccessToken(handlerInfo, authToken, userId, function (
    err,
    user
  ) {
    if (err) {
      if (err.flag == constants.responseFlags.PENDING_VERIFICATION) {
        return responses.sendPendingVerificationResponse(handlerInfo, res);
      }
      if (err.flag == constants.responseFlags.ACCOUNT_SUSPENDED) {
        return responses.sendAccountSuspendedResponse(handlerInfo, res);
      }
      return responses.sendAuthenticationFailure(handlerInfo, res);
    }

    var tasks = [];
    tasks.push(
      getProgramsSubmittedBugs.bind(null, handlerInfo, user.details.program_id)
    );
    async.parallel(tasks, function (err, bugs) {
      if (err) {
        return responses.sendFailureResponse(
          handlerInfo,
          res,
          'Failed to fetch bugs',
          err
        );
      }
      var index = 0;
      var bugList = _.sortBy(bugs[0], (each) => {
        return constants.bugCriticalityToPriorityMapping[each.severity];
      }).map((each) => {
        index++;
        return _.merge(each, {
          index: index,
          status: constants.bugStatusToNameMapping[each.status],
          steps_to_reproduce: JSON.parse(each.steps_to_reproduce),
          screenshots: each.screenshots ? JSON.parse(each.screenshots) : [],
          containsScreenshot: each.screenshots
            ? JSON.parse(each.screenshots).length > 0
            : 0,
          isCriticalSeverity:
            each.severity === 'Critical' || each.severity === 'critical',
          isHighSeverity: each.severity === 'High' || each.severity === 'high',
          isMediumSeverity:
            each.severity === 'Medium' || each.severity === 'medium',
          isLowSeverity: each.severity === 'Low' || each.severity === 'low',
          isNoneSeverity: each.severity === 'None' || each.severity === 'none',
        });
      });
      var templateData = _.merge(
        req.body,
        { bugs: bugList },
        { test_time: new Date() },
          {coverage_asset_type: constants.assetTypeScopeOfWorkMapping[asset_type]}
      );
      var options = {
        format: 'A4',
        orientation: 'portrait',
        border: {
          top: '15mm', // default is 0, units: mm, cm, in, px
          right: '15mm',
          bottom: '10mm',
          left: '15mm',
        },
        footer: {
          height: '10mm',
          contents: {
            default:

              '<div class="flex justify-between items-center">  <!--  <div class="footer-text">Page {{page}} of {{pages}}</div> -->  <img style="width: 70px;" src="https://appsecure.security/static/appsecure-logo@2x-253e0223c2d8f9ad95b32c736b482d49.png"/><div class="footer-text">© Appsecure Security 2025</div></div>',

          },
        },
        type: 'pdf',
        timeout: 10000000,
      };
      pdf
        .create(ReportTemplate(templateData), options)
        .toStream(function (err, stream) {
          if (err) {
            console.log("error while pdf conversion", err);
          }
          res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Access-Control-Allow-Origin': '*',
            'Content-Disposition': 'attachment; filename=report.pdf',
          });
          stream.pipe(res);
        });
    });
  });
}

function getProgramsSubmittedBugs(handlerInfo, programId, callback) {
  var getBugs =
    "SELECT * FROM bugs WHERE program_id = ? AND status in ('OPEN', 'TRIAGED')";

  var getBugsQuery = dbHandler
    .getInstance()
    .executeQuery(getBugs, [programId], function (err, bugs) {
      if (err) {
        return callback(err);
      }
      callback(null, bugs);
    });
}

function getHackerSubmittedBugs(handlerInfo, hackerId, emailId, callback) {
  var getBugs =
    'SELECT b.bug_uuid, b.hacker_alias as hacker_alias, h.profile_image, p.program_uuid as program_id, p.company_name, ' +
    'p.company_logo, b.bug_caption, b.bug_type, b.bug_description, b.bug_image, ' +
    'b.steps_to_reproduce, b.severity, b.suggested_fix, b.http_request, b.bug_impact, b.status, b.bounty_awarded, b.screenshots, b.is_anonymous, ' +
    'b.created_at, b.updated_at, ( SELECT COUNT(id) FROM comments c where c.bug_uuid = b.bug_uuid ' +
    'AND c.user_role = 0 AND c.is_read = 0 ) as newCommentCount ' +
    'FROM hackers h, bugs b, programs p ' +
    'WHERE h.hacker_id = b.hacker_id ' +
    'AND b.program_id = p.program_id ' +
    'AND b.hacker_id = ?';

  var getBugsQuery = dbHandler
    .getInstance()
    .executeQuery(getBugs, [hackerId], function (err, bugs) {
      if (err) {
        return callback(err);
      }
      callback(null, bugs);
    });
}

function getProgramMemberSubmittedBugs(handlerInfo, programMemberId, callback) {
  var getBugs =
    'SELECT b.bug_uuid, m.alias as program_member_alias, b.hacker_alias as hacker_alias, ' +
    'b.hacker_profile_image as profile_image, p.program_uuid as program_id, p.company_name, ' +
    'p.company_logo, b.bug_caption, b.bug_type, b.bug_description, b.bug_image, ' +
    'b.steps_to_reproduce, b.severity, b.suggested_fix, b.http_request, b.bug_impact, b.status, b.bounty_awarded, b.screenshots, b.is_anonymous, ' +
    'b.created_at, b.updated_at, ( SELECT COUNT(id) FROM comments c where c.bug_uuid = b.bug_uuid ' +
    'AND c.user_role = 1 AND c.is_read = 0 ) as newCommentCount ' +
    'FROM program_members m, bugs b, programs p ' +
    'WHERE b.program_id = m.program_id ' +
    'AND m.program_id = p.program_id ' +
    //'AND b.hacker_id = h.hacker_id ' +
    'AND m.program_member_id = ?';

  var getBugsQuery = dbHandler
    .getInstance()
    .executeQuery(getBugs, [programMemberId], function (err, bugs) {
      if (err) {
        return callback(err);
      }
      callback(null, bugs);
    });
}

function getComments(req, res) {
  var handlerInfo = {
    apiModule: 'bugs',
    apiHandler: 'getComments',
  };

  var authToken = req.headers.auth_token;
  var userId = req.headers.user_id;
  var bugUuid = req.query.bug_uuid;

  var manvalues = [authToken, userId, bugUuid];
  var checkblank = commonFun.checkBlank(manvalues);

  if (checkblank) {
    return responses.sendParameterMissingResponse(handlerInfo, res);
  }

  if (
    commonFun.specialCharacterCheck(authToken) ||
    commonFun.specialCharacterCheck(userId) ||
    commonFun.specialCharacterCheck(bugUuid)
  ) {
    return responses.sendHackerJoiningResponse(handlerInfo, res);
  }
  authorization.validateAccessToken(handlerInfo, authToken, userId, function (
    err,
    user
  ) {
    if (err) {
      if (err.flag == constants.responseFlags.PENDING_VERIFICATION) {
        return responses.sendPendingVerificationResponse(handlerInfo, res);
      }
      if (err.flag == constants.responseFlags.ACCOUNT_SUSPENDED) {
        return responses.sendAccountSuspendedResponse(handlerInfo, res);
      }
      return responses.sendAuthenticationFailure(handlerInfo, res);
    }
    getBugByUuid(handlerInfo, bugUuid, function (err, bug) {
      var tasks = [];
      if (!bug) {
        console.log("but does not exist", bugUuid);
      }
      if (bug.hacker_id == 0) {
        tasks.push(
          checkIfBugExistsForMember.bind(
            null,
            handlerInfo,
            user.details,
            bugUuid
          )
        );
      } else {
        tasks.push(
          checkIfBugExistsForUser.bind(
            null,
            handlerInfo,
            user.details,
            user.userRole,
            bugUuid
          )
        );
      }
      tasks.push(
        getCommentsOnBug.bind(null, handlerInfo, bugUuid, user.userRole)
      );

      async.series(tasks, function (err, comments) {
        if (err) {
          return responses.sendFailureResponse(
            handlerInfo,
            res,
            'Failed to fetch comments',
            err
          );
        }
        responses.sendSuccessResponse(
          handlerInfo,
          res,
          'Comments on bug',
          comments[1]
        );
      });
    });
  });
}

function getCommentsOnBug(handlerInfo, bugId, userRole, callback) {
  var getBugs =
    'SELECT comment_uuid, content, user_role, created_at, updated_at, bug_uuid, filled_by_name, is_read ' +
    'FROM comments ' +
    'WHERE bug_uuid = ?';

  var getBugsQuery = dbHandler
    .getInstance()
    .executeQuery(getBugs, [bugId], function (err, comments) {
      if (err) {
        return callback(err);
      }
      callback(null, comments);
    });
}

function postStatus(req, res) {
  var handlerInfo = {
    apiModule: 'bugs',
    apiHandler: 'postComments',
  };

  var authToken = req.headers.auth_token;
  var userId = req.headers.user_id;
  var bugUuid = xss(req.body.bug_uuid);
  var status = parseInt(xss(req.body.status));

  var manvalues = [authToken, userId, bugUuid, status];
  var checkblank = commonFun.checkBlank(manvalues);

  if (checkblank || !status || status < 1 || status > 8 || !bugUuid) {
    return responses.sendParameterMissingResponse(handlerInfo, res);
  }

  for (var key in constants.bugStatus) {
    if (constants.bugStatus[key] === status) {
      status = '*--' + key + '--*';
    }
  }

  if (
    commonFun.specialCharacterCheck(authToken) ||
    commonFun.specialCharacterCheck(userId) ||
    commonFun.specialCharacterCheck(bugUuid)
  ) {
    return responses.sendHackerJoiningResponse(handlerInfo, res);
  }
  authorization.validateAccessToken(handlerInfo, authToken, userId, function (
    err,
    user
  ) {
    if (err) {
      if (err.flag == constants.responseFlags.PENDING_VERIFICATION) {
        return responses.sendPendingVerificationResponse(handlerInfo, res);
      }
      if (err.flag == constants.responseFlags.ACCOUNT_SUSPENDED) {
        return responses.sendAccountSuspendedResponse(handlerInfo, res);
      }
      return responses.sendAuthenticationFailure(handlerInfo, res);
    }

    if (user.userRole != constants.userRole.PROGRAM_MEMBER) {
      return responses.sendUnauthorizedAccessResponse(handlerInfo, res);
    }
    if (user.authLevel == constants.authLevel.USER) {
      return responses.sendUnauthorizedAccessResponse(handlerInfo, res);
    }

    var userType =
      user.userRole == constants.userRole.PROGRAM_MEMBER
        ? constants.userRole.HACKER
        : constants.userRole.PROGRAM_MEMBER;

    getBugByUuid(handlerInfo, bugUuid, function (err, bug) {
      var tasks = [];
      if (bug.hacker_id == 0) {
        tasks.push(
          checkIfBugExistsForMember.bind(
            null,
            handlerInfo,
            user.details,
            bugUuid
          )
        );
      } else {
        tasks.push(
          checkIfBugExistsForUser.bind(
            null,
            handlerInfo,
            user.details,
            user.userRole,
            bugUuid
          )
        );
      }
      tasks.push(postComment.bind(null, handlerInfo, user, bugUuid, status));

      async.waterfall(tasks, function (err, comments) {
        if (err) {
          if (err.flag == constants.responseFlags.UNAUTHORIZED_ACCESS) {
            return responses.sendUnauthorizedAccessResponse(handlerInfo, res);
          }
          return responses.sendFailureResponse(
            handlerInfo,
            res,
            'Failed to post comments : ' + (err.message ? err.message : ''),
            err
          );
        }
        responses.sendSuccessResponse(
          handlerInfo,
          res,
          'successfully posted comment',
          {}
        );
      });
    });
  });
}

function getBugByUuid(handlerInfo, bugUuid, callback) {
  var sql = 'SELECT * from bugs where bug_uuid = ?';
  var values = [bugUuid];

  var sqlQuery = dbHandler
    .getInstance()
    .executeQuery(sql, values, function (err, bug) {
      if (err || !bug.length) {
        err = new Error('No Bugs Found');
        err.flag = constants.responseFlags.UNAUTHORIZED_ACCESS;
        return callback(err);
      }
      callback(null, bug[0]);
    });
}

function postComments(req, res) {
  var handlerInfo = {
    apiModule: 'bugs',
    apiHandler: 'postComments',
  };

  // logging.trace(handlerInfo, {request : req.headers});

  var authToken = req.headers.auth_token;
  var userId = req.headers.user_id;
  var bugUuid = xss(req.body.bug_uuid);
  var content = xss(req.body.content);

  var manvalues = [authToken, userId, bugUuid, content];
  var checkblank = commonFun.checkBlank(manvalues);

  if (checkblank || !bugUuid) {
    return responses.sendParameterMissingResponse(handlerInfo, res);
  }

  if (
    commonFun.specialCharacterCheck(authToken) ||
    commonFun.specialCharacterCheck(userId) ||
    commonFun.specialCharacterCheck(bugUuid)
  ) {
    return responses.sendHackerJoiningResponse(handlerInfo, res);
  }
  authorization.validateAccessToken(handlerInfo, authToken, userId, function (
    err,
    user
  ) {
    if (err) {
      if (err.flag == constants.responseFlags.PENDING_VERIFICATION) {
        return responses.sendPendingVerificationResponse(handlerInfo, res);
      }
      if (err.flag == constants.responseFlags.ACCOUNT_SUSPENDED) {
        return responses.sendAccountSuspendedResponse(handlerInfo, res);
      }
      return responses.sendAuthenticationFailure(handlerInfo, res);
    }

    var userType =
      user.userRole == constants.userRole.PROGRAM_MEMBER
        ? constants.userRole.HACKER
        : constants.userRole.PROGRAM_MEMBER;
    var tasks = [];
    if (user.userRole === constants.userRole.HACKER) {
      tasks.push(
        commonFun.findProgramIdFromBugUuid.bind(null, handlerInfo, bugUuid)
      );
      tasks.push(
        commonFun.checkIfHackerIsMappedToProgram.bind(
          null,
          handlerInfo,
          user.details.hacker_id
        )
      );
      tasks.push(
        checkIfBugExistsForUser.bind(
          null,
          handlerInfo,
          user.details,
          user.userRole,
          bugUuid
        )
      );
    } else {
      tasks.push(
        checkIfBugExistsForMember.bind(null, handlerInfo, user.details, bugUuid)
      );
    }
    tasks.push(postComment.bind(null, handlerInfo, user, bugUuid, content));
    tasks.push(
      sendMailForCommentOnBug.bind(
        null,
        handlerInfo,
        userType,
        user.details.alias,
        bugUuid,
        content
      )
    );

    async.waterfall(tasks, function (err, comments) {
      if (err) {
        if (err.flag == constants.responseFlags.UNAUTHORIZED_ACCESS) {
          return responses.sendUnauthorizedAccessResponse(handlerInfo, res);
        }
        return responses.sendFailureResponse(
          handlerInfo,
          res,
          'Failed to post comments : ' + (err.message ? err.message : ''),
          err
        );
      }
      responses.sendSuccessResponse(
        handlerInfo,
        res,
        'successfully posted comment',
        {}
      );
    });
  });
}

function checkIfBugExistsForMember(handlerInfo, user, bugUuid, callback) {
  var sql =
    'SELECT b.program_id, b.bug_uuid, b.bug_caption, b.bug_id, b.hacker_id, ' +
    'b.created_by, b.hacker_alias FROM bugs b, program_members p WHERE ' +
    'b.program_id = p.program_id AND b.bug_uuid = ? AND p.program_member_id = ?';
  var values = [bugUuid, user.program_member_id];

  var sqlQuery = dbHandler
    .getInstance()
    .executeQuery(sql, values, function (err, bugs) {
      if (err || !bugs.length) {
        err = new Error('No Bugs Found');
        err.flag = constants.responseFlags.UNAUTHORIZED_ACCESS;
        return callback(err);
      }
      var bugDetails = bugs[0];
      callback(null, bugDetails);
    });
}

function checkIfBugExistsForUser(
  handlerInfo,
  user,
  userRole,
  bugUuid,
  callback
) {
  var getBugs, values;
  if (userRole == constants.userRole.HACKER) {
    getBugs =
      'SELECT b.program_id, b.bug_uuid, b.bug_caption, b.bug_id, b.hacker_id, h.email_id, h.alias ' +
      'FROM bugs b, hackers h ' +
      'WHERE b.bug_uuid = ? AND b.hacker_id = ? AND h.hacker_id = b.hacker_id';
    values = [bugUuid, user.hacker_id];
  } else {
    getBugs =
      'SELECT b.program_id, b.bug_uuid, b.bug_caption, b.bug_id, b.hacker_id, h.email_id, h.alias ' +
      'FROM bugs b, program_members p, hackers h ' +
      'WHERE b.program_id = p.program_id ' +
      'AND b.bug_uuid = ? AND p.program_member_id = ? AND b.hacker_id = h.hacker_id';
    values = [bugUuid, user.program_member_id];
  }

  var getBugsQuery = dbHandler
    .getInstance()
    .executeQuery(getBugs, values, function (err, bugs) {
      if (err || !bugs.length) {
        err = new Error('No Bugs Found');
        err.flag = constants.responseFlags.UNAUTHORIZED_ACCESS;
        return callback(err);
      }
      var bugDetails = bugs[0];
      callback(null, bugDetails);
    });
}

function postComment(
  handlerInfo,
  user,
  bugUuid,
  content,
  bugDetails,
  callback
) {
  var bugId = bugDetails.bug_id;
  var commentUuid = crypto.pseudoRandomBytes(10).toString('hex');
  var postComment =
    'INSERT INTO comments ' +
    '(bug_id, bug_uuid, user_role, filled_by_id, filled_by_name, content, comment_uuid) ' +
    'VALUES(?, ?, ?, ?, ?, ?, ?)';

  var values = [
    bugId,
    bugUuid,
    user.userRole,
    !user.userRole ? user.details.program_member_id : user.details.hacker_id,
    user.details.alias,
    content,
    commentUuid,
  ];

  var postCommentQuery = dbHandler
    .getInstance()
    .executeQuery(postComment, values, function (err, bugs) {
      if (err) {
        return callback(err);
      }
      callback(null, bugDetails);
    });
}

function sendMailForCommentOnBug(
  handlerInfo,
  userType,
  alias,
  bugUuid,
  content,
  bugDetails,
  callback
) {
  getEmailIdForSendingMail(
    handlerInfo,
    userType,
    bugUuid,
    bugDetails.program_id,
    function (err, emails) {
      if (userType == constants.userRole.HACKER) {
        // when user is program member then send the emails to hacker + all active program members
        var opts = {
          to: emails[0],
          bcc: emails[1],
          text:
            'Hi, <br><br>  New comment has been posted by  ' +
            alias +
            ' on bug #' +
            bugUuid +
            ' http://139.59.6.20/#/company/bug/' +
            bugUuid +
            '<br><br><br>Thanks, <br> hackerhive.io',
          subject:
            '[HackerHive.io] : Comment added on ' + bugDetails.bug_caption,
        };
        mailer.sendMail(opts, function (err) {
          if (err) {
            return callback(err);
          }
          callback();
        });
      } else {
        var opts = {
          to: emails[0],
          text:
            'Hi, <br><br>  New comment has been posted by  ' +
            alias +
            ' on bug #' +
            bugUuid +
            ' http://139.59.6.20/#/company/bug/' +
            bugUuid +
            '<br><br><br>Thanks,, <br> hackerhive.io',
          subject:
            '[Hackerhive.io] : Comment added on ' + bugDetails.bug_caption,
        };
        mailer.sendMail(opts, function (err) {
          if (err) {
            return callback(err);
          }
          callback();
        });
      }
    }
  );
}

/*function updateBug(req, res){
    var handlerInfo = {
        apiModule  : 'bugs',
        apiHandler : 'updateBug'
    };

    var authToken       = req.headers.auth_token;
    var userId          = req.headers.user_id;
    var status          = parseInt(xss(req.body.status));
    var bugUuid         = req.body.bug_uuid;
    var bountyAwarded   = parseInt(xss(req.body.bounty_awarded));

    var manvalues = [authToken, userId, status, bugUuid];

    var checkblank = commonFun.checkBlank(manvalues);

    if (checkblank || (!status || status < 1 || status > 8) || !bugUuid) {
        return responses.sendParameterMissingResponse(handlerInfo, res);
    }
    for(var key in constants.bugStatus){
      	if(constants.bugStatus[key] === status) {
            status = key;
        }
    }

    var isBountyAwarded = bountyAwarded ? 1 : 0;

if(commonFun.specialCharacterCheck(authToken) || commonFun.specialCharacterCheck(userId)) {
        return responses.sendHackerJoiningResponse(handlerInfo, res);
    }
    authorization.validateAccessToken(handlerInfo, authToken, userId, function(err, user) {
        if (err) {
            if(err.flag == constants.responseFlags.PENDING_VERIFICATION){
                return responses.sendPendingVerificationResponse(handlerInfo, res);
            }
            if(err.flag == constants.responseFlags.ACCOUNT_SUSPENDED){
                return responses.sendAccountSuspendedResponse(handlerInfo, res);
            }
            return responses.sendAuthenticationFailure(handlerInfo, res);
        }

        if(user.userRole != constants.userRole.PROGRAM_MEMBER){
            return responses.sendUnauthorizedAccessResponse(handlerInfo, res);
        }

     	if(user.authLevel == constants.authLevel.USER) {
            return responses.sendUnauthorizedAccessResponse(handlerInfo, res);
        }

        var tasks = [
            checkIfBugExistsForUser.bind(null, handlerInfo, user.details, user.userRole, bugUuid)
        ];
        if(isBountyAwarded){
            tasks.push(checkIfBountyExists.bind(null, handlerInfo, bugUuid));
        }
        tasks.push(updateBugStatus.bind(null, handlerInfo, bugUuid, status, isBountyAwarded, bountyAwarded, user.details.alias));
        tasks.push(sendMailForBugUpdate.bind(null, handlerInfo, user.details.alias));
        if (status === "RESOLVED") {
			var score = 20;
			tasks.push(assignScore.bind(null, handlerInfo, status, score));
		}
        if (status === "INFORMATIVE") {
			var score = 5;
			tasks.push(assignScore.bind(null, handlerInfo, status, score));
		}
		if(isBountyAwarded){
			tasks.push(sendMailForBountyToHacker.bind(null, handlerInfo, bountyAwarded));
        }

        async.waterfall(tasks, function(err, update){
            if(err){
                return responses.sendFailureResponse(handlerInfo, res, 'Failed to update bug : ' + (err.message ? err.message : ''), err);
            }
            responses.sendSuccessResponse(handlerInfo, res, 'Successfully updated bug', {});
        });
    });
}*/

function updateBug(req, res) {
  var handlerInfo = {
    apiModule: 'bugs',
    apiHandler: 'updateBug',
  };

  var authToken = req.headers.auth_token;
  var userId = req.headers.user_id;
  var status = parseInt(xss(req.body.status));
  var bugUuid = req.body.bug_uuid;
  var bountyAwarded = parseInt(xss(req.body.bounty_awarded));

  var manvalues = [authToken, userId, status, bugUuid];

  var checkblank = commonFun.checkBlank(manvalues);

  if (checkblank || !status || status < 1 || status > 8 || !bugUuid) {
    return responses.sendParameterMissingResponse(handlerInfo, res);
  }
  for (var key in constants.bugStatus) {
    if (constants.bugStatus[key] === status) {
      status = key;
    }
  }

  var isBountyAwarded = bountyAwarded ? 1 : 0;

  if (
    commonFun.specialCharacterCheck(authToken) ||
    commonFun.specialCharacterCheck(userId) ||
    commonFun.specialCharacterCheck(bugUuid)
  ) {
    return responses.sendHackerJoiningResponse(handlerInfo, res);
  }
  authorization.validateAccessToken(handlerInfo, authToken, userId, function (
    err,
    user
  ) {
    if (err) {
      if (err.flag == constants.responseFlags.PENDING_VERIFICATION) {
        return responses.sendPendingVerificationResponse(handlerInfo, res);
      }
      if (err.flag == constants.responseFlags.ACCOUNT_SUSPENDED) {
        return responses.sendAccountSuspendedResponse(handlerInfo, res);
      }
      return responses.sendAuthenticationFailure(handlerInfo, res);
    }

    if (user.userRole != constants.userRole.PROGRAM_MEMBER) {
      return responses.sendUnauthorizedAccessResponse(handlerInfo, res);
    }

    if (user.authLevel == constants.authLevel.USER) {
      return responses.sendUnauthorizedAccessResponse(handlerInfo, res);
    }

    isHackerMappedWithBugInfo(handlerInfo, bugUuid, user.details, function (
      err,
      bug
    ) {
      var tasks = [];
      var bugDetails = bug[0];
      var isHackerRegistered = bugDetails.isHackerRegistered;
      var isHackerMapped = bugDetails.isHackerMapped;
      var isBugRelatedToProgramMember =
        bugDetails.program_id == user.details.program_id ? true : false;
      var isBountyAlreadyAwarded = bugDetails.bounty_awarded ? true : false;

      if (!isHackerMapped && !(status === 'CLOSED')) {
        /** create mapping as the program member has responded to the bug when status is not closed*/
        tasks.push(commonFun.createMapping.bind(null, handlerInfo, bug[0]));
        //return responses.sendFailureResponse(handlerInfo, res, 'Hacker Mapping not found, cannot update bug');
      }

      if (isBountyAlreadyAwarded) {
        return responses.sendFailureResponse(
          handlerInfo,
          res,
          'Bounty Already Exist'
        );
      }

      if (isBugRelatedToProgramMember && !isBountyAlreadyAwarded) {
        tasks.push(
          updateBugStatus.bind(
            null,
            handlerInfo,
            bugUuid,
            status,
            isBountyAwarded,
            bountyAwarded,
            user.details.alias,
            bugDetails
          )
        );
      }
      tasks.push(
        sendMailForBugUpdate.bind(
          null,
          handlerInfo,
          user.details.alias,
          isHackerRegistered
        )
      );

      if (isHackerRegistered) {
        if (status === 'RESOLVED') {
          var score = 20;
          tasks.push(assignScore.bind(null, handlerInfo, status, score));
        }
        if (status === 'INFORMATIVE') {
          var score = 5;
          tasks.push(assignScore.bind(null, handlerInfo, status, score));
        }
      }

      if (!isBountyAlreadyAwarded && isBountyAwarded) {
        tasks.push(
          sendMailForBountyToHacker.bind(null, handlerInfo, bountyAwarded)
        );
      }

      async.waterfall(tasks, function (err, update) {
        if (err) {
          return responses.sendFailureResponse(
            handlerInfo,
            res,
            'Failed to update bug : ' + (err.message ? err.message : ''),
            err
          );
        }
        responses.sendSuccessResponse(
          handlerInfo,
          res,
          'Successfully updated bug',
          {}
        );
      });
    });
  });
}

function deleteBugHandler(req, res) {
  var handlerInfo = {
    apiModule: 'bugs',
    apiHandler: 'deleteBugHandler',
  };

  var authToken = req.headers.auth_token;
  var userId = req.headers.user_id;
  var bugUuid = req.body.bug_uuid;

  var manvalues = [authToken, userId, bugUuid];

  var checkblank = commonFun.checkBlank(manvalues);

  if (checkblank || !bugUuid) {
    return responses.sendParameterMissingResponse(handlerInfo, res);
  }
  if (
      commonFun.specialCharacterCheck(authToken) ||
      commonFun.specialCharacterCheck(userId) ||
      commonFun.specialCharacterCheck(bugUuid)
  ) {
    return responses.sendHackerJoiningResponse(handlerInfo, res);
  }
  authorization.validateAccessToken(handlerInfo, authToken, userId, function (
      err,
      user
  ) {
    if (err) {
      if (err.flag == constants.responseFlags.PENDING_VERIFICATION) {
        return responses.sendPendingVerificationResponse(handlerInfo, res);
      }
      if (err.flag == constants.responseFlags.ACCOUNT_SUSPENDED) {
        return responses.sendAccountSuspendedResponse(handlerInfo, res);
      }
      return responses.sendAuthenticationFailure(handlerInfo, res);
    }

    if (user.userRole != constants.userRole.PROGRAM_MEMBER) {
      return responses.sendUnauthorizedAccessResponse(handlerInfo, res);
    }

    if (user.authLevel == constants.authLevel.USER) {
      return responses.sendUnauthorizedAccessResponse(handlerInfo, res);
    }

    isHackerMappedWithBugInfo(handlerInfo, bugUuid, user.details, function (
        err,
        bug
    ) {
      var tasks = [];
      var bugDetails = bug[0];
      var isHackerRegistered = bugDetails.isHackerRegistered;


      tasks.push(
          deleteBug.bind(
              null,
              bugUuid
          )
      );

      async.waterfall(tasks, function (err, update) {
        if (err) {
          return responses.sendFailureResponse(
              handlerInfo,
              res,
              'Failed to delete bug : ' + (err.message ? err.message : ''),
              err
          );
        }
        responses.sendSuccessResponse(
            handlerInfo,
            res,
            'Successfully deleted bug',
            {}
        );
      });
    });
  });
}

function isHackerMappedWithBugInfo(handlerInfo, bugUuid, user, callback) {
  var sql = 'select * from bugs where bug_uuid = ?';
  var sqlQuery = dbHandler
    .getInstance()
    .executeQuery(sql, [bugUuid], function (err, bug) {
      if (err || !bug.length) {
        return callback(err);
      }
      var isHackerRegistered = true;
      var isHackerMapped = false;
      if (bug[0].hacker_id == 0) {
        //Then the hacker is not registered
        isHackerRegistered = false;
        commonFun.checkIfAnonymousMappingExists(
          handlerInfo,
          bug[0].hacker_alias,
          bug[0].program_id,
          function (err, hackerInfo) {
            if (err) {
              return callback(err);
            }
            if (hackerInfo.already_mapped) {
              isHackerMapped = true;
            }
            bug[0].isHackerRegistered = isHackerRegistered;
            bug[0].isHackerMapped = isHackerMapped;
            callback(null, bug);
          }
        );
      } else {
        bug[0].isHackerRegistered = isHackerRegistered;
        bug[0].isHackerMapped = false;
        callback(null, bug);
      }
    });
}

function checkIfBountyExists(handlerInfo, bugUuid, bugDetails, callback) {
  var sql =
    'SELECT 1 FROM bugs WHERE bug_uuid = ? AND bounty_awarded IS NOT NULL';

  var sqlQuery = dbHandler
    .getInstance()
    .executeQuery(sql, [bugUuid], function (err, select) {
      if (err || select.length) {
        return callback(new Error('Bounty already inserted. Cant be updated'));
      }
      callback(null, bugDetails);
    });
}

function updateBugStatus(
  handlerInfo,
  bugUuid,
  status,
  isBountyAwarded,
  bountyAwarded,
  updatedBy,
  bugDetails,
  callback
) {
  var data = {
    status: status,
    updated_by: updatedBy,
  };

  if (isBountyAwarded) {
    data.bounty_awarded = bountyAwarded;
  }
  var sql = 'UPDATE bugs SET ? WHERE bug_uuid = ?';

  var sqlQuery = dbHandler
    .getInstance()
    .executeQuery(sql, [data, bugUuid], function (err, update) {
      if (err) {
        return callback(err);
      }
      callback(null, bugDetails);
    });
}

function deleteBug(bugUuid, callback) {
  var sql = 'DELETE from bugs WHERE bug_uuid = ?';

  var sqlQuery = dbHandler
      .getInstance()
      .executeQuery(sql, [bugUuid], function (err, update) {
        if (err) {
          return callback(err);
        }
        callback(null);
      });
}

function sendMailForBugUpdate(
  handlerInfo,
  alias,
  isHackerRegistered,
  bugDetails,
  callback
) {
  getEmailIdForSendingMail(
    handlerInfo,
    constants.userRole.HACKER,
    bugDetails.bug_uuid,
    bugDetails.program_id,
    function (err, emails) {
      var to = isHackerRegistered ? emails[0] : [bugDetails.hacker_alias];

      var bcc = isHackerRegistered ? emails[1] : emails[0];
      bugDetails.email_id = isHackerRegistered
        ? emails[1]
        : bugDetails.hacker_alias;
      console.log('to => ', to);
      console.log('bcc => ', bcc);
      console.log('hacker_alias => ', bugDetails.hacker_alias);
      var opts = {
        to: to,
        bcc: bcc,
        text:
          'Hi, <br><br> Your Bug http://139.59.6.20#/hacker/bug/' +
          bugDetails.bug_uuid +
          ' status has been updated by ' +
          alias +
          '<br><br>Please login to HackerHive.io to check<br><br>',
        subject: '[HackerHive.io] ' + ' Vulnerability status updated',
      };
      mailer.sendMail(opts, function (err) {
        if (err) {
          return callback(err);
        }
        callback(null, bugDetails);
      });
    }
  );
}

function assignScore(
  handlerInfo,
  status,
  score,
  isHackerRegistered,
  bugDetails,
  callback
) {
  var sql =
    'UPDATE hackers set points = points + ?, fixed = fixed + 1 WHERE hacker_id = ?';
  var values = [score, bugDetails.hacker_id];

  var sqlQuery = dbHandler
    .getInstance()
    .executeQuery(sql, values, function (err, upd) {
      if (err) {
        return callback(new Error('error updating score'));
      }
      callback(null, bugDetails);
    });
}

function sendMailForBountyToHacker(
  handlerInfo,
  bountytohacker,
  bugDetails,
  callback
) {
  var opts = {
    to: [bugDetails.email_id],
    text:
      'Hi,<br><br>You are awarded ' +
      '<b>Rs.</b>' +
      '<b>' +
      bountytohacker +
      '</b>' +
      ' as a bounty on ' +
      '<b>' +
      bugDetails.bug_caption +
      '</b>' +
      '<br><br>Congratulations!<br><br> <b>What is next?</b><br>' +
      'Please update your payment info on hackerhive. Your bounty will be paid within 30 days.<br><br>',
    subject:
      '[Security][Hackerhive.io] ' +
      ':Bug bounty awarded on-' +
      bugDetails.bug_caption,
  };
  mailer.sendMail(opts, function (err) {
    if (err) {
      return callback(err);
    }
    callback(err);
  });
}

function moveToJira(req, res) {
  var handlerInfo = {
    apiModule: 'bugs',
    apiHandler: 'moveToJira',
  };

  // logging.trace(handlerInfo, {headers : req.headers}, {Query : req.query});
  var bugId = req.body.bug_uuid;
  var authToken = req.headers.auth_token;
  var userId = req.headers.user_id;

  if (
      commonFun.specialCharacterCheck(authToken) ||
      commonFun.specialCharacterCheck(userId) ||
      commonFun.specialCharacterCheck(bugId)
  ) {
    return responses.sendHackerJoiningResponse(handlerInfo, res);
  }
  authorization.validateAccessToken(handlerInfo, authToken, userId, function (
      err,
      user
  ) {
    // if (user.userRole != constants.userRole.PROGRAM_MEMBER) {
    //   return responses.sendUnauthorizedAccessResponse(handlerInfo, res);
    // }
    //
    // if (user.authLevel == constants.authLevel.USER) {
    //   return responses.sendUnauthorizedAccessResponse(handlerInfo, res);
    // }

    var query1 = 'select * from bugs where bug_uuid=? ';

    var sqlQuery = dbHandler
        .getInstance()
        .executeQuery(query1, [bugId], function (err, bugs) {
          // logging.logDatabaseQuery(handlerInfo, 'Checking for data', err, select, sqlQuery.sql);
          if (bugs == null) {
            responses.sendSuccessResponse(handlerInfo, res, 'Null value', {});
          } else {
            var bug_desc = bugs[0].bug_description;
            var steps_to_reproduce = bugs[0].steps_to_reproduce;
            var severity = bugs[0].severity;
            var suggested_fix = bugs[0].suggested_fix;
            var http_request = bugs[0].http_request;
            var bug_impact = bugs[0].bug_impact;
            var bug_type = bugs[0].bug_type;
            var bug_status = bugs[0].status;
            var bug_caption = bugs[0].bug_caption;
            var programidval = bugs[0].program_id;

            var program_id_query =
                'select * from program_members where member_uuid=? AND auth_token=?';
            var sqlQuery_pgm_id = dbHandler
                .getInstance()
                .executeQuery(program_id_query, [userId, authToken], function (
                    err,
                    program_members
                ) {
                  // logging.logDatabaseQuery(handlerInfo, 'Checking for data', err, select, sqlQuery.sql);
                  if (err) {
                    responses.sendSuccessResponse(
                        handlerInfo,
                        res,
                        ' Data Mismatched',
                        {}
                    );
                  } else {
                    var pgmidval = program_members[0].program_id;
                    // if (pgmidval !== programidval) {
                    //   return responses.sendUnauthorizedAccessResponse(
                    //       handlerInfo,
                    //       res
                    //   );
                    // }

                    var sqlquery2 = 'select * from programs where program_id=?';
                    var sqlQuery3 = dbHandler
                        .getInstance()
                        .executeQuery(sqlquery2, [pgmidval], function (err, programs) {
                          // logging.logDatabaseQuery(handlerInfo, 'Checking for data', err, select, sqlQuery.sql);

                          if (err) {
                            responses.sendSuccessResponse(
                                handlerInfo,
                                res,
                                'Data Mismatched  ' + sqlquery2 + pgmidval,
                                {}
                            );
                          } else {
                            createJiraTicket(bugs[0], program_members[0], programs[0], function (err, data) {
                              if (err) {
                                return responses.sendSuccessResponse(
                                    handlerInfo,
                                    res,
                                    'Error while creating Jira ticket',
                                    {}
                                );
                              }
                              responses.sendSuccessResponse(
                                  handlerInfo,
                                  res,
                                  'Ticket created',
                                  {
                                    "ticket": data.key
                                  }
                              );
                            })
                          }
                        });
                  }
                });
          }
        });
  });
}

var createJiraTicket = function (bugDetails, userDetails, programDetails, callback) {
  bugDetails.http_request = commonFun.escapeJson(bugDetails.http_request);
  bugDetails.suggested_fix = commonFun.escapeJson(bugDetails.suggested_fix);
  bugDetails.steps_to_reproduce = _.map(JSON.parse(bugDetails.steps_to_reproduce), (step) => {
    step.data = commonFun.escapeJson(step.data);
    return step;
  });
  var payload = JSON.parse(commonFun.escapeNewLine(JiraIssueTemplate({bug: bugDetails})));
  payload.fields.project.key = programDetails.jira_project_key;
  payload.fields.issuetype.id = programDetails.jira_issue_type;
  var authToken = programDetails.jira_email_id + ':' + programDetails.jira_token;
  var buff = new Buffer(authToken);
  authToken = buff.toString('base64');
  request.post({
    method: 'POST',
    uri: programDetails.jira_url + '/rest/api/3/issue',
    body: payload,
    headers: {
      'Authorization': 'Basic ' + authToken
    },
    json: true
  }, async function (err, res, body) {
    if (err || !_.isEmpty(body.errorMessages) || !_.isEmpty(body.errors)) return callback(err || "Something went wrong");
    var screenshots = JSON.parse(bugDetails.screenshots) || [];
    for (var i = 0; i < screenshots.length; i++) {
      try {
        var fileName = await commonFun.downloadFile(screenshots[i]);
        await rp({
          method: 'POST',
          uri: programDetails.jira_url + '/rest/api/3/issue/' + body.key + '/attachments',
          formData: {
            file: fs.createReadStream(fileName)
          },
          headers: {
            'Authorization': 'Basic ' + authToken,
            'X-Atlassian-Token': 'no-check'
          }
        });
        await fs.unlinkSync(fileName);
      } catch (e) {
        return callback(e);
      }
    }
    callback(null, body);
  });
}

exports.listJiraProjects = async function(req, res) {
  var handlerInfo = {
    apiModule: 'bugs',
    apiHandler: 'listJiraProject',
  };
  var instanceUrl = req.query.jira_url;
  var emailId = req.query.jira_email_id;
  var apiKey = req.query.jira_token;

  var manvalues = [instanceUrl, emailId, apiKey];

  var checkblank = commonFun.checkBlank(manvalues);

  if (checkblank) {
    return responses.sendParameterMissingResponse(handlerInfo, res);
  }

  var projects = [];
  var start = 0;
  var authToken = emailId + ':' + apiKey;
  var buff = new Buffer(authToken);
  authToken = buff.toString('base64');
  while(true) {
    var response =  await rp({
      method: 'GET',
      uri: instanceUrl + '/rest/api/2/project/search?expand=issueTypes&status=live&startAt=' + start,
      headers: {
        'Authorization': 'Basic ' + authToken
      },
      json: true
    });
    projects = projects.concat(response.values);
    if (response.isLast) {
      break;
    }
    start = start + 50;
  }
  var apiResponse = _.map(projects, (each) => {
    return {
      key: each.key,
      id: each.id,
      name: each.name,
      link: instanceUrl + "/browse/" + each.key,
      issueTypes: _.map(each.issueTypes, (type) => {
        return {
          id: type.id,
          name: type.name
        }
      })
    };
  });
  return responses.sendSuccessResponse(
      handlerInfo,
      res,
      'Success',
      apiResponse
  );
}

/**
 * Rohit - added on 15-Dec-2016
 * This function takes out all the records of a company and sums the reward history of the company
 * till date
 */
function totalreward(req, res) {
  var handlerInfo = {
    apiModule: 'bugs',
    apiHandler: 'totalreward',
  };

  // logging.trace(handlerInfo, {headers : req.headers}, {BODY : req.body});

  var authToken = req.headers.auth_token;
  var userId = req.headers.user_id;

  var manvalues = [authToken, userId];
  var checkblank = commonFun.checkBlank(manvalues);

  if (checkblank) {
    return responses.sendParameterMissingResponse(handlerInfo, res);
  }

  if (
    commonFun.specialCharacterCheck(authToken) ||
    commonFun.specialCharacterCheck(userId)
  ) {
    return responses.sendHackerJoiningResponse(handlerInfo, res);
  }
  authorization.validateAccessToken(handlerInfo, authToken, userId, function (
    err,
    user
  ) {
    if (err) {
      if (err.flag == constants.responseFlags.PENDING_VERIFICATION) {
        return responses.sendPendingVerificationResponse(handlerInfo, res);
      }
      if (err.flag == constants.responseFlags.ACCOUNT_SUSPENDED) {
        return responses.sendAccountSuspendedResponse(handlerInfo, res);
      }
      return responses.sendAuthenticationFailure(handlerInfo, res);
    }
    if (user.userRole != constants.userRole.PROGRAM_MEMBER) {
      return responses.sendUnauthorizedAccessResponse(handlerInfo, res);
    }

    var tasks = [fetchTotalreward.bind(null, handlerInfo, userId)];

    async.parallel(tasks, function (err, leaders) {
      if (err) {
        return responses.sendFailureResponse(
          handlerInfo,
          res,
          'Failed to fetch total rewarded',
          err
        );
      }
      responses.sendSuccessResponse(
        handlerInfo,
        res,
        'Total rewarded till date',
        leaders[0]
      );
    });
  });
}

function fetchTotalreward(handlerInfo, userId, callback) {
  var sql =
    'SELECT count (*) as total, SUM(bounty_awarded) as totalreward ' +
    'FROM bugs b, program_members p ' +
    'WHERE b.program_id = p.program_id AND p.program_member_id = ? AND b.bounty_awarded != "NULL"';

  var sqlQuery = dbHandler
    .getInstance()
    .executeQuery(sql, [userId], function (err, leaders) {
      // logging.logDatabaseQuery(handlerInfo, 'getting total bounty Awarded', err, leaders, sqlQuery.sql);
      if (err) {
        return callback(err);
      }
      callback(null, leaders);
    });
}

/**
 * Rohit - added on 15-Dec-2016
 * This function takes out all the records of a company and sums the reward history of the company
 * for the current month
 */
function totalRewardThisMonth(req, res) {
  var handlerInfo = {
    apiModule: 'bugs',
    apiHandler: 'totalRewardThisMonth',
  };

  // logging.trace(handlerInfo, {headers : req.headers}, {BODY : req.body});

  var authToken = req.headers.auth_token;
  var userId = req.headers.user_id;

  var manvalues = [authToken, userId];
  var checkblank = commonFun.checkBlank(manvalues);

  if (checkblank) {
    return responses.sendParameterMissingResponse(handlerInfo, res);
  }

  if (
    commonFun.specialCharacterCheck(authToken) ||
    commonFun.specialCharacterCheck(userId)
  ) {
    return responses.sendHackerJoiningResponse(handlerInfo, res);
  }
  authorization.validateAccessToken(handlerInfo, authToken, userId, function (
    err,
    user
  ) {
    if (err) {
      if (err.flag == constants.responseFlags.PENDING_VERIFICATION) {
        return responses.sendPendingVerificationResponse(handlerInfo, res);
      }
      if (err.flag == constants.responseFlags.ACCOUNT_SUSPENDED) {
        return responses.sendAccountSuspendedResponse(handlerInfo, res);
      }
      return responses.sendAuthenticationFailure(handlerInfo, res);
    }
    if (user.userRole != constants.userRole.PROGRAM_MEMBER) {
      return responses.sendUnauthorizedAccessResponse(handlerInfo, res);
    }

    var tasks = [fetchtotalRewardThisMonth.bind(null, handlerInfo, userId)];

    async.parallel(tasks, function (err, leaders) {
      if (err) {
        return responses.sendFailureResponse(
          handlerInfo,
          res,
          'Failed to fetch total rewarded this month',
          err
        );
      }
      responses.sendSuccessResponse(
        handlerInfo,
        res,
        'Total rewarded this month',
        leaders[0]
      );
    });
  });
}

function fetchtotalRewardThisMonth(handlerInfo, userId, callback) {
  var sql =
    'SELECT count(*) as total, SUM(bounty_awarded) as totalRewardThisMonth ' +
    'FROM bugs b, program_members p ' +
    'WHERE b.program_id = p.program_id AND p.program_member_id = ? AND YEAR(CURRENT_DATE()) = YEAR(b.updated_at) ' +
    'AND MONTH(CURRENT_DATE()) = MONTH(b.updated_at) AND b.bounty_awarded != "NULL"';

  var sqlQuery = dbHandler
    .getInstance()
    .executeQuery(sql, [userId], function (err, leaders) {
      // logging.logDatabaseQuery(handlerInfo, 'getting total bounty Awarded this month', err, leaders, sqlQuery.sql);
      if (err) {
        return callback(err);
      }
      callback(null, leaders);
    });
}

/**
 * Rohit - added on 15-Dec-2016
 * This function takes out all the records of a company with resolved bugs
 */
function resolvedBugs(req, res) {
  var handlerInfo = {
    apiModule: 'bugs',
    apiHandler: 'resolvedBugs',
  };

  // logging.trace(handlerInfo, {headers : req.headers}, {BODY : req.body});

  var authToken = req.headers.auth_token;
  var userId = req.headers.user_id;

  var manvalues = [authToken, userId];
  var checkblank = commonFun.checkBlank(manvalues);

  if (checkblank) {
    return responses.sendParameterMissingResponse(handlerInfo, res);
  }

  if (
    commonFun.specialCharacterCheck(authToken) ||
    commonFun.specialCharacterCheck(userId)
  ) {
    return responses.sendHackerJoiningResponse(handlerInfo, res);
  }
  authorization.validateAccessToken(handlerInfo, authToken, userId, function (
    err,
    user
  ) {
    if (err) {
      if (err.flag == constants.responseFlags.PENDING_VERIFICATION) {
        return responses.sendPendingVerificationResponse(handlerInfo, res);
      }
      if (err.flag == constants.responseFlags.ACCOUNT_SUSPENDED) {
        return responses.sendAccountSuspendedResponse(handlerInfo, res);
      }
      return responses.sendAuthenticationFailure(handlerInfo, res);
    }
    if (user.userRole != constants.userRole.PROGRAM_MEMBER) {
      return responses.sendUnauthorizedAccessResponse(handlerInfo, res);
    }

    var tasks = [fetchResolvedBugs.bind(null, handlerInfo, userId)];

    async.parallel(tasks, function (err, leaders) {
      if (err) {
        return responses.sendFailureResponse(
          handlerInfo,
          res,
          'Failed to fetch resolved bugs',
          err
        );
      }
      responses.sendSuccessResponse(
        handlerInfo,
        res,
        'resolved bugs',
        leaders[0]
      );
    });
  });
}

function fetchResolvedBugs(handlerInfo, userId, callback) {
  var sql =
    'SELECT count(*) as total ' +
    'FROM bugs b, program_members p ' +
    'WHERE b.program_id = p.program_id AND p.program_member_id = ? AND b.status = "RESOLVED"';

  var sqlQuery = dbHandler
    .getInstance()
    .executeQuery(sql, [userId], function (err, leaders) {
      // logging.logDatabaseQuery(handlerInfo, 'getting resolved bugs', err, leaders, sqlQuery.sql);
      if (err) {
        return callback(err);
      }
      callback(null, leaders);
    });
}

/**
 * Rohit - added on 15-Dec-2016
 * This function takes out all the records of a company with active bugs
 */
function activeBugs(req, res) {
  var handlerInfo = {
    apiModule: 'bugs',
    apiHandler: 'activeBugs',
  };

  // logging.trace(handlerInfo, {headers : req.headers}, {BODY : req.body});

  var authToken = req.headers.auth_token;
  var userId = req.headers.user_id;

  var manvalues = [authToken, userId];
  var checkblank = commonFun.checkBlank(manvalues);

  if (checkblank) {
    return responses.sendParameterMissingResponse(handlerInfo, res);
  }

  if (
    commonFun.specialCharacterCheck(authToken) ||
    commonFun.specialCharacterCheck(userId)
  ) {
    return responses.sendHackerJoiningResponse(handlerInfo, res);
  }
  authorization.validateAccessToken(handlerInfo, authToken, userId, function (
    err,
    user
  ) {
    if (err) {
      if (err.flag == constants.responseFlags.PENDING_VERIFICATION) {
        return responses.sendPendingVerificationResponse(handlerInfo, res);
      }
      if (err.flag == constants.responseFlags.ACCOUNT_SUSPENDED) {
        return responses.sendAccountSuspendedResponse(handlerInfo, res);
      }
      return responses.sendAuthenticationFailure(handlerInfo, res);
    }
    if (user.userRole != constants.userRole.PROGRAM_MEMBER) {
      return responses.sendUnauthorizedAccessResponse(handlerInfo, res);
    }

    var tasks = [fetchActiveBugs.bind(null, handlerInfo, userId)];

    async.parallel(tasks, function (err, leaders) {
      if (err) {
        return responses.sendFailureResponse(
          handlerInfo,
          res,
          'Failed to fetch open bugs',
          err
        );
      }
      responses.sendSuccessResponse(handlerInfo, res, 'open bugs', leaders[0]);
    });
  });
}

function fetchActiveBugs(handlerInfo, userId, callback) {
  var sql =
    'SELECT count(*) as total ' +
    'FROM bugs b, program_members p ' +
    'WHERE b.program_id = p.program_id AND p.program_member_id = ? AND b.status = "OPEN"';

  var sqlQuery = dbHandler
    .getInstance()
    .executeQuery(sql, [userId], function (err, leaders) {
      // logging.logDatabaseQuery(handlerInfo, 'getting open bugs', err, leaders, sqlQuery.sql);
      if (err) {
        return callback(err);
      }
      callback(null, leaders);
    });
}

/**
 * Rohit - added on 15-Dec-2016
 * This function takes out all the records of a company with awarded bugs
 */
function totalAwardedBugs(req, res) {
  var handlerInfo = {
    apiModule: 'bugs',
    apiHandler: 'totalAwardedBugs',
  };

  // logging.trace(handlerInfo, {headers : req.headers}, {BODY : req.body});

  var authToken = req.headers.auth_token;
  var userId = req.headers.user_id;

  var manvalues = [authToken, userId];
  var checkblank = commonFun.checkBlank(manvalues);

  if (checkblank) {
    return responses.sendParameterMissingResponse(handlerInfo, res);
  }

  if (
    commonFun.specialCharacterCheck(authToken) ||
    commonFun.specialCharacterCheck(userId)
  ) {
    return responses.sendHackerJoiningResponse(handlerInfo, res);
  }
  authorization.validateAccessToken(handlerInfo, authToken, userId, function (
    err,
    user
  ) {
    if (err) {
      if (err.flag == constants.responseFlags.PENDING_VERIFICATION) {
        return responses.sendPendingVerificationResponse(handlerInfo, res);
      }
      if (err.flag == constants.responseFlags.ACCOUNT_SUSPENDED) {
        return responses.sendAccountSuspendedResponse(handlerInfo, res);
      }
      return responses.sendAuthenticationFailure(handlerInfo, res);
    }
    if (user.userRole != constants.userRole.PROGRAM_MEMBER) {
      return responses.sendUnauthorizedAccessResponse(handlerInfo, res);
    }

    var tasks = [fetchAwardedBugs.bind(null, handlerInfo, userId)];

    async.parallel(tasks, function (err, leaders) {
      if (err) {
        return responses.sendFailureResponse(
          handlerInfo,
          res,
          'Failed to fetch awarded bugs',
          err
        );
      }
      responses.sendSuccessResponse(
        handlerInfo,
        res,
        'awarded bugs',
        leaders[0]
      );
    });
  });
}

function fetchAwardedBugs(handlerInfo, userId, callback) {
  var sql =
    'SELECT count(*) as total ' +
    'FROM bugs b, program_members p ' +
    'WHERE b.program_id = p.program_id AND p.program_member_id = ? AND b.bounty_awarded != "NULL"';

  var sqlQuery = dbHandler
    .getInstance()
    .executeQuery(sql, [userId], function (err, leaders) {
      // logging.logDatabaseQuery(handlerInfo, 'getting awarded bugs', err, leaders, sqlQuery.sql);
      if (err) {
        return callback(err);
      }
      callback(null, leaders);
    });
}

/**
 * Rohit - added on 15-Dec-2016
 * This function takes out all the records of a company with closed bugs
 */
function totalClosedBugs(req, res) {
  var handlerInfo = {
    apiModule: 'bugs',
    apiHandler: 'totalClosedBugs',
  };

  // logging.trace(handlerInfo, {headers : req.headers}, {BODY : req.body});

  var authToken = req.headers.auth_token;
  var userId = req.headers.user_id;

  var manvalues = [authToken, userId];
  var checkblank = commonFun.checkBlank(manvalues);

  if (checkblank) {
    return responses.sendParameterMissingResponse(handlerInfo, res);
  }

  if (
    commonFun.specialCharacterCheck(authToken) ||
    commonFun.specialCharacterCheck(userId)
  ) {
    return responses.sendHackerJoiningResponse(handlerInfo, res);
  }
  authorization.validateAccessToken(handlerInfo, authToken, userId, function (
    err,
    user
  ) {
    if (err) {
      if (err.flag == constants.responseFlags.PENDING_VERIFICATION) {
        return responses.sendPendingVerificationResponse(handlerInfo, res);
      }
      if (err.flag == constants.responseFlags.ACCOUNT_SUSPENDED) {
        return responses.sendAccountSuspendedResponse(handlerInfo, res);
      }
      return responses.sendAuthenticationFailure(handlerInfo, res);
    }
    if (user.userRole != constants.userRole.PROGRAM_MEMBER) {
      return responses.sendUnauthorizedAccessResponse(handlerInfo, res);
    }

    var tasks = [fetchClosedBugs.bind(null, handlerInfo, userId)];

    async.parallel(tasks, function (err, leaders) {
      if (err) {
        return responses.sendFailureResponse(
          handlerInfo,
          res,
          'Failed to fetch closed bugs',
          err
        );
      }
      responses.sendSuccessResponse(
        handlerInfo,
        res,
        'closed bugs',
        leaders[0]
      );
    });
  });
}

function fetchClosedBugs(handlerInfo, userId, callback) {
  var sql =
    'SELECT count(*) as total ' +
    'FROM bugs b, program_members p ' +
    'WHERE b.program_id = p.program_id AND p.program_member_id = ? AND b.status = "CLOSED"';

  var sqlQuery = dbHandler
    .getInstance()
    .executeQuery(sql, [userId], function (err, leaders) {
      // logging.logDatabaseQuery(handlerInfo, 'getting closed bugs', err, leaders, sqlQuery.sql);
      if (err) {
        return callback(err);
      }
      callback(null, leaders);
    });
}

/**
 * Rohit - added on 28-Dec-2016
 * This function takes out all the records of a company with triaged bugs
 */
function totalTriagedBugs(req, res) {
  var handlerInfo = {
    apiModule: 'bugs',
    apiHandler: 'totalTriagedBugs',
  };

  // logging.trace(handlerInfo, {headers : req.headers}, {BODY : req.body});

  var authToken = req.headers.auth_token;
  var userId = req.headers.user_id;

  var manvalues = [authToken, userId];
  var checkblank = commonFun.checkBlank(manvalues);

  if (checkblank) {
    return responses.sendParameterMissingResponse(handlerInfo, res);
  }

  if (
    commonFun.specialCharacterCheck(authToken) ||
    commonFun.specialCharacterCheck(userId)
  ) {
    return responses.sendHackerJoiningResponse(handlerInfo, res);
  }
  authorization.validateAccessToken(handlerInfo, authToken, userId, function (
    err,
    user
  ) {
    if (err) {
      if (err.flag == constants.responseFlags.PENDING_VERIFICATION) {
        return responses.sendPendingVerificationResponse(handlerInfo, res);
      }
      if (err.flag == constants.responseFlags.ACCOUNT_SUSPENDED) {
        return responses.sendAccountSuspendedResponse(handlerInfo, res);
      }
      return responses.sendAuthenticationFailure(handlerInfo, res);
    }
    if (user.userRole != constants.userRole.PROGRAM_MEMBER) {
      return responses.sendUnauthorizedAccessResponse(handlerInfo, res);
    }

    var tasks = [fetchTriagedBugs.bind(null, handlerInfo, userId)];

    async.parallel(tasks, function (err, leaders) {
      if (err) {
        return responses.sendFailureResponse(
          handlerInfo,
          res,
          'Failed to fetch triaged bugs',
          err
        );
      }
      responses.sendSuccessResponse(
        handlerInfo,
        res,
        'triaged bugs',
        leaders[0]
      );
    });
  });
}

function fetchTriagedBugs(handlerInfo, userId, callback) {
  var sql =
    'SELECT count(*) as total ' +
    'FROM bugs b, program_members p ' +
    'WHERE b.program_id = p.program_id AND p.program_member_id = ? AND b.status = "TRIAGED"';

  var sqlQuery = dbHandler
    .getInstance()
    .executeQuery(sql, [userId], function (err, leaders) {
      // logging.logDatabaseQuery(handlerInfo, 'getting triaged bugs', err, leaders, sqlQuery.sql);
      if (err) {
        return callback(err);
      }
      callback(null, leaders);
    });
}

/**
 * Rohit - added on 28-Dec-2016
 * This function takes out all the records of a top awarded bug
 */
function topAwardedBug(req, res) {
  var handlerInfo = {
    apiModule: 'bugs',
    apiHandler: 'topAwardedBug',
  };

  // logging.trace(handlerInfo, {headers : req.headers}, {BODY : req.body});

  var authToken = req.headers.auth_token;
  var userId = req.headers.user_id;

  var manvalues = [authToken, userId];
  var checkblank = commonFun.checkBlank(manvalues);

  if (checkblank) {
    return responses.sendParameterMissingResponse(handlerInfo, res);
  }

  if (
    commonFun.specialCharacterCheck(authToken) ||
    commonFun.specialCharacterCheck(userId)
  ) {
    return responses.sendHackerJoiningResponse(handlerInfo, res);
  }
  authorization.validateAccessToken(handlerInfo, authToken, userId, function (
    err,
    user
  ) {
    if (err) {
      if (err.flag == constants.responseFlags.PENDING_VERIFICATION) {
        return responses.sendPendingVerificationResponse(handlerInfo, res);
      }
      if (err.flag == constants.responseFlags.ACCOUNT_SUSPENDED) {
        return responses.sendAccountSuspendedResponse(handlerInfo, res);
      }
      return responses.sendAuthenticationFailure(handlerInfo, res);
    }
    if (user.userRole != constants.userRole.PROGRAM_MEMBER) {
      return responses.sendUnauthorizedAccessResponse(handlerInfo, res);
    }

    var tasks = [fetchTopAwardedBug.bind(null, handlerInfo, userId)];

    async.parallel(tasks, function (err, leaders) {
      if (err) {
        return responses.sendFailureResponse(
          handlerInfo,
          res,
          'Failed to fetch top awarded bug',
          err
        );
      }
      responses.sendSuccessResponse(
        handlerInfo,
        res,
        'top awarded bug',
        leaders[0]
      );
    });
  });
}

function fetchTopAwardedBug(handlerInfo, userId, callback) {
  var sql =
    'SELECT MAX(b.bounty_awarded) as awardedBounty, b.created_by ' +
    'FROM bugs b, program_members p ' +
    'WHERE b.program_id = p.program_id AND p.program_member_id = ? AND b.bounty_awarded != "NULL"';

  var sqlQuery = dbHandler
    .getInstance()
    .executeQuery(sql, [userId], function (err, leaders) {
      // logging.logDatabaseQuery(handlerInfo, 'top awarded bug', err, leaders, sqlQuery.sql);
      if (err) {
        return callback(err);
      }
      callback(null, leaders);
    });
}

/**
 * Rohit - added on 20-Feb-2016
 * This function takes out all the users related to a bug
 */
function relatedUsersWithBug(req, res) {
  var handlerInfo = {
    apiModule: 'bugs',
    apiHandler: 'relatedUsersWithBug',
  };

  // logging.trace(handlerInfo, {headers : req.headers}, {BODY : req.body});

  var authToken = req.headers.auth_token;
  var userId = req.headers.user_id;
  var bugUuid = req.query.bug_uuid;

  var manvalues = [authToken, userId, bugUuid];
  var checkblank = commonFun.checkBlank(manvalues);
  if (checkblank) {
    return responses.sendParameterMissingResponse(handlerInfo, res);
  }

  if (
    commonFun.specialCharacterCheck(authToken) ||
    commonFun.specialCharacterCheck(userId)
  ) {
    return responses.sendHackerJoiningResponse(handlerInfo, res);
  }
  authorization.validateAccessToken(handlerInfo, authToken, userId, function (
    err,
    user
  ) {
    if (err) {
      if (err.flag == constants.responseFlags.PENDING_VERIFICATION) {
        return responses.sendPendingVerificationResponse(handlerInfo, res);
      }
      if (err.flag == constants.responseFlags.ACCOUNT_SUSPENDED) {
        return responses.sendAccountSuspendedResponse(handlerInfo, res);
      }
      return responses.sendAuthenticationFailure(handlerInfo, res);
    }

    var sql =
      'SELECT program_id, hacker_id, created_by FROM bugs WHERE bug_uuid = ?';

    var sqlQuery = dbHandler
      .getInstance()
      .executeQuery(sql, [bugUuid], function (err, results) {
        // logging.logDatabaseQuery(handlerInfo, 'related users of a bug', err, results, sqlQuery.sql);
        if (err) {
          return callback(err);
        }
        var usersList = [];
        var hackerId = results[0].hacker_id;
        var programId = results[0].program_id;
        var tasks = [];
        if (results[0].hacker_id == 0) {
          tasks.push(
            getMemberAlias.bind(null, handlerInfo, programId, usersList)
          );
        } else {
          tasks.push(
            getHackerAlias.bind(null, handlerInfo, hackerId, usersList)
          );
          tasks.push(
            getMemberAlias.bind(null, handlerInfo, programId, usersList)
          );
        }
        async.series(tasks, function (err) {
          if (err) {
            return responses.sendFailureResponse(
              handlerInfo,
              res,
              'Failed to fetch related users of a bug',
              err
            );
          }
          responses.sendSuccessResponse(
            handlerInfo,
            res,
            'related users of a bug',
            usersList
          );
        });
      });
  });
}

function getHackerAlias(handlerInfo, hackerId, usersList, callback) {
  var sql =
    'SELECT alias FROM hackers WHERE hacker_id = ? and status = "ACTIVE"';

  var sqlQuery = dbHandler
    .getInstance()
    .executeQuery(sql, [hackerId], function (err, results) {
      // logging.logDatabaseQuery(handlerInfo, 'related hacker(s) of a bug', err, results, sqlQuery.sql);
      if (err) {
        return callback(err);
      }
      for (var i in results) {
        usersList.push(results[i].alias);
      }
      callback(null, usersList);
    });
}

function getMemberAlias(handlerInfo, programId, usersList, callback) {
  var sql =
    'SELECT alias FROM program_members WHERE program_id = ? and status = "ACTIVE"';

  var sqlQuery = dbHandler
    .getInstance()
    .executeQuery(sql, [programId], function (err, results) {
      // logging.logDatabaseQuery(handlerInfo, 'related member(s) of a bug', err, results, sqlQuery.sql);
      if (err) {
        return callback(err);
      }
      for (var i in results) {
        usersList.push(results[i].alias);
      }
      callback(null, usersList);
    });
}

function changeCommentStatus(req, res) {
  var handlerInfo = {
    apiModule: 'bugs',
    apiHandler: 'changeCommentStatus',
  };

  // logging.trace(handlerInfo, {request : req.headers});

  var authToken = req.headers.auth_token;
  var userId = req.headers.user_id;
  var bugUuid = req.query.bug_uuid;
  var status = parseInt(req.query.status);
  var commentUuid = req.query.comment_uuid;

  var manvalues = [authToken, userId, bugUuid, status, commentUuid];
  var checkblank = commonFun.checkBlank(manvalues);

  if (checkblank || !bugUuid) {
    return responses.sendParameterMissingResponse(handlerInfo, res);
  }
  if (status != 1) {
    return responses.sendFailureResponse(
      handlerInfo,
      res,
      'Status nto acceptable'
    );
  }

  if (
    commonFun.specialCharacterCheck(authToken) ||
    commonFun.specialCharacterCheck(userId) ||
    commonFun.specialCharacterCheck(bugUuid) ||
    commonFun.specialCharacterCheck(commentUuid)
  ) {
    return responses.sendHackerJoiningResponse(handlerInfo, res);
  }
  authorization.validateAccessToken(handlerInfo, authToken, userId, function (
    err,
    user
  ) {
    if (err) {
      if (err.flag == constants.responseFlags.PENDING_VERIFICATION) {
        return responses.sendPendingVerificationResponse(handlerInfo, res);
      }
      if (err.flag == constants.responseFlags.ACCOUNT_SUSPENDED) {
        return responses.sendAccountSuspendedResponse(handlerInfo, res);
      }
      return responses.sendAuthenticationFailure(handlerInfo, res);
    }

    var userType =
      user.userRole == constants.userRole.PROGRAM_MEMBER
        ? constants.userRole.HACKER
        : constants.userRole.PROGRAM_MEMBER;

    var tasks = [
      checkIfBugExistsForUser.bind(
        null,
        handlerInfo,
        user.details,
        user.userRole,
        bugUuid
      ),
      markCommentRead.bind(null, handlerInfo, status, commentUuid),
    ];

    async.series(tasks, function (err, comments) {
      if (err) {
        if (err.flag == constants.responseFlags.UNAUTHORIZED_ACCESS) {
          return responses.sendUnauthorizedAccessResponse(handlerInfo, res);
        }
        return responses.sendFailureResponse(
          handlerInfo,
          res,
          'Failed to change comment status ',
          err
        );
      }
      responses.sendSuccessResponse(
        handlerInfo,
        res,
        'status successfully changed ',
        {}
      );
    });
  });
}

function markCommentRead(handlerInfo, status, commentUuid, callback) {
  var query =
    'UPDATE comments set is_read = ? where is_read = 0 AND user_role = ? AND comment_uuid = ?';
  var execQuery = dbHandler
    .getInstance()
    .executeQuery(query, [status, commentUuid], function (err, comment) {
      if (err) {
        return callback(err);
      }
      callback();
    });
}

function reportAnonymousBug(req, res) {
  var handlerInfo = {
    apiModule: 'bugs',
    apiHandler: 'reportAnonymousBug',
  };

  var program_handle = req.query.program_handle;
  var bug_caption = req.body.bug_caption;
  var bug_description = req.body.bug_description;
  var steps_to_reproduce = req.body.steps_to_reproduce;
  var severity = xss(req.body.severity);
  var cvss_score = xss(req.body.cvss_score);
  var cvss_vector = xss(req.body.cvss_vector);
  var screenshots = req.body.screenshots
    ? JSON.stringify(req.body.screenshots)
    : '[]';
  var suggested_fix = xss(req.body.suggested_fix);
  var http_request = xss(req.body.http_request);
  var bug_impact = xss(req.body.bug_impact);
  var bug_type = xss(req.body.bug_type);
  var hacker_email_id = xss(req.body.email_id);
  var agree_to_terms = xss(req.body.agree_to_terms) ? 1 : 0;

  var manvalues = [
    program_handle,
    bug_caption,
    bug_description,
    steps_to_reproduce,
    severity,
    suggested_fix,
    http_request,
    bug_impact,
    bug_type,
    agree_to_terms,
    hacker_email_id,
  ];
  var checkblank = commonFun.checkBlank(manvalues);

  if (checkblank) {
    return responses.sendParameterMissingResponse(handlerInfo, res);
  }

  if (
    commonFun.specialCharacterCheck(program_handle) ||
    !commonFun.emailFormatCheck(hacker_email_id)
  ) {
    return responses.sendHackerJoiningResponse(handlerInfo, res);
  }

  if (!agree_to_terms) {
    return responses.sendAgreeToTermsResponse(handlerInfo, res);
  }

  commonFun.getUserByEmailId(handlerInfo, hacker_email_id, function (
    err,
    user
  ) {
    var tasks = [];
    var hackerId = 0;
    var alias = '';
    tasks.push(
      programs.getProgramIdByHandle.bind(null, handlerInfo, program_handle)
    );
    if (err) {
      if (err.flag == constants.responseFlags.ACCOUNT_SUSPENDED) {
        return responses.sendAccountSuspendedResponse(handlerInfo, res);
      } else {
        /**
         * Check can be added to see if its a public program or private
         * Case 1: when hacker is not part of hackerhive then add hacker to the database
         * our table requires data to be filled by hacker only, since we do not have much data
         * Hence its better to send the hacker an email to register with details,
         * add the member to newmember table.. and then send the invite to join
         */
        hackerId = 0;
        alias = hacker_email_id;
        tasks.push(
          hackers.addAnonymousHacker.bind(null, handlerInfo, hacker_email_id)
        );
        tasks.push(
          createAnonymousMapping.bind(null, handlerInfo, hacker_email_id)
        );
        tasks.push(
          insertBug.bind(
            null,
            handlerInfo,
            hackerId,
            bug_caption,
            bug_description,
            steps_to_reproduce,
            severity,
            cvss_score,
            cvss_vector,
            screenshots,
            suggested_fix,
            http_request,
            bug_impact,
            bug_type,
            alias,
            'https://res.cloudinary.com/dq1fr3elj/image/upload/v1517394082/members/default_profile_image.png',
            1
          )
        );
        tasks.push(
          sendMailForCreatedBug.bind(
            null,
            handlerInfo,
            alias,
            hacker_email_id,
            bug_caption
          )
        );

        async.waterfall(tasks, function (err, data) {
          if (err) {
            return responses.sendFailureResponse(
              handlerInfo,
              res,
              'Failed to post the bug',
              err
            );
          }
          responses.sendSuccessResponse(
            handlerInfo,
            res,
            'You have successfully posted the bug',
            err
          );
        });
      }
    } else {
      /**
       * Case 2: when reporter is a part of hackerhive, either as Hacker or Program Member
       * then dont allow reporter to post bug for now
       */

      return responses.sendFailureResponse(
        handlerInfo,
        res,
        'You can post the bug by going to hackerhive'
      );
      //if(user.userRole === constants.userRole.PROGRAM_MEMBER) {
      //    return responses.sendFailureResponse(handlerInfo, res, "Failed to post the bug :");
      //}
      //if(user.userRole === constants.userRole.HACKER) {
      //    return responses.sendFailureResponse(handlerInfo, res, "Failed to post the bug :");
      //}
    }
  });
}
function createAnonymousMapping(handlerInfo, emailId, programId, callback) {
  var getPrograms =
    'SELECT 1  ' +
    'FROM anonymous_hacker_program_mapping ' +
    'WHERE reporter_email_id = ? ' +
    'AND program_id = ?';

  var getProgramsQuery = dbHandler
    .getInstance()
    .executeQuery(getPrograms, [emailId, programId], function (err, programs) {
      if (err) {
        return callback(err);
      }
      if (!programs.length) {
        var setMapping1 =
          'INSERT into anonymous_hacker_program_mapping ' +
          '(reporter_email_id, program_id, status) VALUES (?, ?, ?)';

        var setMappingQuery1 = dbHandler
          .getInstance()
          .executeQuery(setMapping1, [emailId, programId, 'ACTIVE'], function (
            err1,
            programs1
          ) {
            if (err1) {
              return callback(
                new Error(
                  'Failed to create relation between hacker and the program'
                )
              );
            }
            return callback(null, programId);
          });
      } else {
        return callback(null, programId);
      }
    });
}
