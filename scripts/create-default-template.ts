import { storage } from "../server/storage";

const DEFAULT_VAPT_TEMPLATE_HTML = `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <style>
    html {
        font-size: 14px;
        word-wrap: break-word;
    }

    body {
        font-family: 'Arial', sans-serif;
        line-height: 1.6;  
        margin: 0;
        padding: 0;
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

    /* Basic utility classes */
    .w-full { width: 100%; }
    .w-1-2 { width: 50%; }
    .w-1-6 { width: 16.66%; }
    .w-5-6 { width: 83.33%; }
    .mt-8 { margin-top: 2rem; }
    .mt-16 { margin-top: 4rem; }
    .ml-4 { margin-left: 1rem; }
    .my-2 { margin-top: 0.5rem; margin-bottom: 0.5rem; }
    .my-4 { margin-top: 1rem; margin-bottom: 1rem; }
    .my-6 { margin-top: 1.5rem; margin-bottom: 1.5rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-8 { margin-bottom: 2rem; }
    .pl-2 { padding-left: 0.5rem; }
    .pl-4 { padding-left: 1rem; }
    .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .py-5 { padding-top: 1.25rem; padding-bottom: 1.25rem; }
    .pb-2 { padding-bottom: 0.5rem; }
    .pb-3 { padding-bottom: 0.75rem; }
    .pb-5 { padding-bottom: 1.25rem; }
    .pt-2 { padding-top: 0.5rem; }
    .text-xl { font-size: 1.25rem; }
    .text-lg { font-size: 1.125rem; }
    .text-base { font-size: 1rem; }
    .text-sm { font-size: 0.875rem; }
    .text-xs { font-size: 0.75rem; }
    .font-medium { font-weight: 500; }
    .font-semibold { font-weight: 600; }
    .font-light { font-weight: 300; }
    .text-gray-900 { color: #1a202c; }
    .text-gray-800 { color: #2d3748; }
    .text-gray-700 { color: #4a5568; }
    .text-blue-500 { color: #3182ce; }
    .text-black { color: #000; }
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .border { border: 1px solid #e2e8f0; }
    .border-b { border-bottom: 1px solid #e2e8f0; }
    .border-b-2 { border-bottom: 2px solid #e2e8f0; }
    .bg-gray-100 { background-color: #f7fafc; }
    .rounded { border-radius: 0.25rem; }
    .leading-6 { line-height: 1.5; }
    .break-words { word-wrap: break-word; }
    .table { display: table; }
    .table-auto { table-layout: auto; }
    .table-row { display: table-row; }
    .table-row-group { display: table-row-group; }
    .table-cell { display: table-cell; }

    @media print {
        .page {
            margin: 0;
            min-height: 100%;
            width: 100%;
        }
    }
    </style>
    <title>{{report_title}}</title>
</head>

<body>
    <!-- Cover Page -->
    <div class="page">
        <div style="text-align: center; margin-top: 100px;">
            <h1 style="font-size: 18px; font-weight: bold; margin-bottom: 20px;">{{company_name}} {{application_type}}</h1>
            <h2 style="font-size: 16px; font-weight: bold; margin-bottom: 60px;">Security Assessment Report</h2>
            
            <div style="margin: 60px 0;">
                {{#each test_scope}}
                <p style="margin: 10px 0;">{{this}}</p>
                {{/each}}
            </div>
            
            <div style="margin-top: 100px;">
                <p style="font-weight: bold;">REPORT PUBLISH DATE</p>
                <p style="margin-top: 10px;">{{test_time}}</p>
            </div>
        </div>
        
        <div style="position: absolute; bottom: 30px; width: 100%; text-align: center;">
            <p style="font-size: 12px;">Page 1 of 14 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; © {{organization_name}} {{current_year}}</p>
        </div>
        <div style="page-break-after: always;"></div>
    </div>

    <!-- Contents -->
    <div class="page">
        <h1 style="font-size: 18px; font-weight: bold; margin-bottom: 20px;">Contents</h1>
        <div style="margin-top: 30px;">
            <table style="width: 100%; font-size: 12px;">
                <tr>
                    <td>Executive Summary</td>
                    <td style="text-align: right;">3</td>
                </tr>
                <tr>
                    <td>Security Checklist</td>
                    <td style="text-align: right;">4</td>
                </tr>
                <tr>
                    <td>Scope of Work</td>
                    <td style="text-align: right;">7</td>
                </tr>
                <tr>
                    <td>Methodology</td>
                    <td style="text-align: right;">9</td>
                </tr>
                <tr>
                    <td style="padding-left: 20px;">Pre Engagement</td>
                    <td style="text-align: right;">9</td>
                </tr>
                <tr>
                    <td style="padding-left: 20px;">Penetration Testing</td>
                    <td style="text-align: right;">9</td>
                </tr>
                <tr>
                    <td style="padding-left: 20px;">Post Engagement | 30 days time after Reporting (Reverification)</td>
                    <td style="text-align: right;">9</td>
                </tr>
                <tr>
                    <td style="padding-left: 20px;">Severity Ratings</td>
                    <td style="text-align: right;">10</td>
                </tr>
                <tr>
                    <td style="padding-left: 20px;">Severity Rating Scale</td>
                    <td style="text-align: right;">10</td>
                </tr>
                <tr>
                    <td>Vulnerabilities Summary</td>
                    <td style="text-align: right;">11</td>
                </tr>
                <tr>
                    <td>Appendix A - Vulnerability Summary & Recommendations</td>
                    <td style="text-align: right;">12</td>
                </tr>
            </table>
        </div>
        <div style="position: absolute; bottom: 30px; width: 100%; text-align: center;">
            <p style="font-size: 12px;">Page 2 of 14 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; © {{organization_name}} {{current_year}}</p>
        </div>
        <div style="page-break-after: always;"></div>
    </div>

    <!-- Executive Summary Page -->
    <div class="page">
        <h1 style="font-size: 18px; font-weight: bold; margin-bottom: 20px;">Executive Summary</h1>
        <div style="font-size: 12px; line-height: 1.6; text-align: justify;">
            <p style="margin-bottom: 15px;">{{organization_name}} successfully conducted a comprehensive Vulnerability Assessment and Penetration Testing (VAPT) engagement for {{company_name}}'s {{application_type}}. The objective was to identify security gaps that could expose the organization to potential threats and ensure compliance with industry best practices.</p>
            
            <p style="margin-bottom: 15px;">The assessment methodology included both manual and automated testing approaches, providing an in-depth evaluation of the application's security posture. Testing was guided by the OWASP Top 10 Web Application Security Risks, covering critical areas such as authentication, access control, input validation, and session management.</p>
            
            <p style="margin-bottom: 15px;">{{executive_summary}}</p>
            
            <p style="margin-bottom: 15px;">Below is a graphical representation of the vulnerabilities discovered</p>
        </div>
        
        <div style="position: absolute; bottom: 30px; width: 100%; text-align: center;">
            <p style="font-size: 12px;">Page 3 of 14 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; © {{organization_name}} {{current_year}}</p>
        </div>
        <div style="page-break-after: always;"></div>
    </div>

    <!-- Security Checklist Page -->
    <div class="page">
        <h1 style="font-size: 18px; font-weight: bold; margin-bottom: 20px;">Security Checklist</h1>
        <div style="margin-top: 30px; font-size: 10px;">
            <!-- Identity Management Testing -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr>
                        <th style="background-color: #f0f0f0; padding: 10px; border: 1px solid #ccc; text-align: left;" colspan="2">1. Identity Management Testing</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="border: 1px solid #ccc; padding: 8px; width: 50%;">1.1 Test Role Definitions</td>
                        <td style="border: 1px solid #ccc; padding: 8px;">1.2 Test User Registration Process</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #ccc; padding: 8px;">1.3 Test Account Provisioning Process</td>
                        <td style="border: 1px solid #ccc; padding: 8px;">1.4 Testing for Account Enumeration and Guessable User Account</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #ccc; padding: 8px;">1.5 Testing for Weak or Unenforced Username Policy</td>
                        <td style="border: 1px solid #ccc; padding: 8px;"></td>
                    </tr>
                </tbody>
            </table>

            <!-- Authentication Testing -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <thead>
                    <tr>
                        <th style="background-color: #f0f0f0; padding: 10px; border: 1px solid #ccc; text-align: left;" colspan="2">2. Authentication Testing</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style="border: 1px solid #ccc; padding: 8px; width: 50%;">2.1 Testing for Credentials Transported over an Encrypted Channel</td>
                        <td style="border: 1px solid #ccc; padding: 8px;">2.2 Testing for Default Credentials</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #ccc; padding: 8px;">2.3 Testing for Weak Lock Out Mechanism</td>
                        <td style="border: 1px solid #ccc; padding: 8px;">2.4 Testing for Bypassing Authentication Schema</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #ccc; padding: 8px;">2.5 Testing for Vulnerable Remember Password</td>
                        <td style="border: 1px solid #ccc; padding: 8px;">2.6 Testing for Browser Cache Weaknesses</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #ccc; padding: 8px;">2.7 Testing for Weak Password Policy</td>
                        <td style="border: 1px solid #ccc; padding: 8px;">2.8 Testing for Weak Security Question Answer</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #ccc; padding: 8px;">2.9 Testing for Weak Password Change or Reset Functionalities</td>
                        <td style="border: 1px solid #ccc; padding: 8px;">2.10 Testing for Weaker Authentication in Alternative Channel</td>
                    </tr>
                </tbody>
            </table>

            <!-- Add more security categories as needed -->
        </div>
        
        <div style="position: absolute; bottom: 30px; width: 100%; text-align: center;">
            <p style="font-size: 12px;">Page 4 of 14 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; © {{organization_name}} {{current_year}}</p>
        </div>
        <div style="page-break-after: always;"></div>
    </div>

    <!-- Scope of Work Page -->
    <div class="page">
        <h1 style="font-size: 18px; font-weight: bold; margin-bottom: 20px;">Scope of Work</h1>
        
        <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 15px; margin-top: 30px;">Coverage</h2>
        <div style="font-size: 12px; line-height: 1.6; text-align: justify;">
            <p style="margin-bottom: 15px;">This penetration test was a manual assessment of the security of the app's functionality, business logic, and vulnerabilities such as those cataloged in the OWASP Top 10. The assessment also included a review of security controls and requirements listed in the OWASP Application Security Verification Standard (ASVS). The researchers rely on tools to facilitate their work, but the majority of the assessment involves manual analysis.</p>
            
            <p style="margin-bottom: 10px;">The following is a quick summary of the main tests performed on the {{application_type}}:</p>
            <ul style="margin-left: 20px; margin-bottom: 15px;">
                <li style="margin-bottom: 5px;">Authenticated user testing for session and authentication issues</li>
                <li style="margin-bottom: 5px;">Authorization testing for privilege escalation and access control issues</li>
                <li style="margin-bottom: 5px;">Input injection tests (SQL injection, XSS, and others)</li>
                <li style="margin-bottom: 5px;">Platform configuration and infrastructure tests</li>
                <li style="margin-bottom: 5px;">OWASP Top 10 Assessment</li>
            </ul>
            <p style="margin-bottom: 15px;">The team had access to authenticated users, enabling them to test security controls across roles and permissions.</p>
        </div>
        
        <div style="position: absolute; bottom: 30px; width: 100%; text-align: center;">
            <p style="font-size: 12px;">Page 7 of 14 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; © {{organization_name}} {{current_year}}</p>
        </div>
        <div style="page-break-after: always;"></div>
    </div>

    <!-- Scope Target Description and Assumptions Page -->
    <div class="page">
        <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 15px;">Target description</h2>
        <div style="font-size: 12px; line-height: 1.6;">
            <p style="margin-bottom: 10px;">The following URLs/apps were in scope for this assessment:</p>
            <ul style="margin-left: 20px; margin-bottom: 20px;">
                {{#each test_scope}}
                <li style="margin-bottom: 5px;">{{this}}</li>
                {{/each}}
            </ul>
        </div>
        
        <h2 style="font-size: 14px; font-weight: bold; margin-bottom: 15px;">Assumptions/Constraints</h2>
        <div style="font-size: 12px; line-height: 1.6;">
            <p style="margin-bottom: 15px;">1. The issues identified and proposed action plans in this report are based on our testing performed within the limited timespan and limited access to the servers. We made specific efforts to verify the accuracy and authenticity of the information gathered only in those cases where it was deemed necessary.</p>
            
            <p style="margin-bottom: 15px;">2. While precautions have been taken in the preparation of this document, {{organization_name}} the publisher, and the author(s) assume no responsibility for errors, omissions, or for damages resulting from the use of the information contained herein. Use of {{organization_name}}'s services does not guarantee the security of a system, or that computer intrusions will not occur.</p>
            
            <p style="margin-bottom: 15px;">3. Any configuration changes or software/hardware updates made on hosts/machines or on the application covered in this test after the date mentioned herein may impact the security posture either positively or negatively and hence invalidates the claims & observations in this report. Whenever there is a change in the architecture, we recommend that you conduct a vulnerability assessment and penetration test to ensure that your security posture is compliant with your security policies.</p>
        </div>
        
        <div style="position: absolute; bottom: 30px; width: 100%; text-align: center;">
            <p style="font-size: 12px;">Page 8 of 14 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; © {{organization_name}} {{current_year}}</p>
        </div>
        <div style="page-break-after: always;"></div>
    </div>

    <!-- Methodology Page -->
    <div class="page text-gray-700 text-sm font-light">
        <h1 class="text-lg font-medium text-gray-900">Methodology</h1>
        <div class="w-full border border-b border-grey-200 my-2"></div>
        <p>The test was done according to penetration testing best practices. The flow from start to finish is listed below.</p>
        
        <div class="my-4 pl-4">
            <p class="font-medium text-gray-800">Pre Engagement</p>
            <div class="pl-4 text-xs">
                <li class="my-2">Scoping</li>
                <li class="my-2">Discovery</li>
            </div>
        </div>
        
        <div class="my-4 pl-4">
            <p class="font-medium text-gray-800">Penetration Testing</p>
            <div class="pl-4 text-xs">
                <li class="my-2">Tool assisted assessment</li>
                <li class="my-2">Manual assessment of OWASP top 10/SANS top 25 & business logic flaws</li>
                <li class="my-2">Exploitation</li>
                <li class="my-2">Risk analysis</li>
                <li class="my-2">Reporting</li>
            </div>
        </div>
        
        <div class="my-4 pl-4">
            <p class="font-medium text-gray-800">Post Engagement</p>
            <div class="pl-4 text-xs">
                <li class="my-2">Best practice support</li>
                <li class="my-2">Re-testing</li>
            </div>
        </div>

        <h2 class="text-base text-gray-800 font-medium mb-1 mt-8">Severity Ratings</h2>
        <p class="pb-5">The Common Vulnerability Scoring System (CVSS) v3.0 is a framework for rating the severity of security vulnerabilities in software. Operated by the Forum of Incident Response and Security Teams (FIRST), the CVSS uses an algorithm to determine three severity rating scores: Base, Temporal and Environmental. The scores are numeric; they range from 0.0 through 10.0 with 10.0 being the most severe.</p>
        
        <h2 class="text-base text-gray-800 font-medium mb-1">Severity Rating Scale</h2>
        <p class="pb-5">Findings are grouped into four criticality levels based on their risk.</p>
        
        <div style="page-break-after: always;"></div>
    </div>

    <!-- Vulnerabilities Summary -->
    <div class="page text-gray-700 text-sm font-light">
        <h1 class="text-lg font-medium text-gray-900">Vulnerabilities Summary</h1>
        <div class="table w-full">
            <div class="table-row-group">
                <div class="table-row text-xs" style="background-color: #dde7ea;">
                    <div class="table-cell text-gray-800 px-2 pl-4 py-4">S.NO.</div>
                    <div class="table-cell text-gray-800 px-2 pl-4 py-4">VULNERABILITY TITLE</div>
                    <div class="table-cell text-gray-800 px-2 py-5 text-center">IMPACT</div>
                    <div class="table-cell text-gray-800 px-2 py-5 text-center">STATE</div>
                </div>
                {{#each findings}}
                <div class="table-row bg-gray-100" style="background-color:rgb(247, 250, 252);">
                    <div class="table-cell text-blue-500 px-2 pl-4 py-5">{{@index}}</div>
                    <div class="table-cell text-blue-500 px-2 pl-4 py-5">{{title}}</div>
                    <div class="table-cell text-gray-800 px-2 py-5 text-center {{severity}}">{{severity}}</div>
                    <div class="table-cell text-gray-800 px-2 py-5 text-center">{{status}}</div>
                </div>
                {{/each}}
            </div>
        </div>
        <div style="page-break-after: always;"></div>
    </div>

    <!-- Appendix A - Vulnerability Summary & Recommendations -->
    <div class="page text-gray-700 text-sm font-light">
        <h1 class="text-lg font-medium text-gray-900">Appendix A - Vulnerability Summary & Recommendations</h1>
        
        {{#each findings}}
        <!-- Individual Finding -->
        <div class="flex items-center w-full my-2 pb-3 border-b-2 border-gray-200">
            <div class="w-5-6">
                <h1 class="text-sm font-medium text-gray-800 break-words">
                    <span class="text-xs text-gray-700 font-normal">#{{@index}} </span>{{title}}
                </h1>
                <div class="flex items-center my-2 font-medium" style="font-size: 10px;">
                    <span class="{{severity}} border border-{{severity}} px-2 rounded">{{severity}}</span>
                    <p class="pl-2 text-gray-700">{{type}}</p>
                </div>
                {{#if cvssScore}}
                <div class="flex items-center my-2 font-medium" style="font-size: 10px;">
                    <p class="pl-2 text-gray-700">CVSS Score: {{cvssScore}}</p>
                </div>
                {{/if}}
                {{#if cvssVector}}
                <div class="flex items-center my-2 font-medium" style="font-size: 10px;">
                    <p class="pl-2 text-gray-700">CVSS Vector: {{cvssVector}}</p>
                </div>
                {{/if}}
            </div>
        </div>

        <div class="flex w-full my-6 pb-3 border-b-2 border-gray-200 text-xs">
            <div class="w-1-6 text-xs mr-2 text-gray-700">DESCRIPTION</div>
            <div class="w-5-6 pl-2 break-words text-xs">
                <pre>{{description}}</pre>
            </div>
        </div>

        <div class="flex w-full my-6 pb-3 border-b-2 border-gray-200 text-xs">
            <div class="w-1-6 text-xs mr-2 text-gray-700">STEPS TO REPRODUCE</div>
            <div class="w-5-6 pl-2 break-words text-xs">
                <pre>{{stepsToReproduce}}</pre>
            </div>
        </div>

        {{#if screenshots}}
        <div class="flex w-full my-6 pb-3 border-b-2 border-gray-200 text-xs">
            <div class="w-1-6 text-xs mr-2 text-gray-700">SCREENSHOTS</div>
            <div class="w-5-6 pl-2 break-words text-xs">
                {{#each screenshots}}
                <img style="max-height: 400px; width: auto; max-width: 100%; height: auto;" src="{{this}}" /><br>
                {{/each}}
            </div>
        </div>
        {{/if}}

        <div class="flex w-full my-6 pb-3 border-b-2 border-gray-200 text-xs">
            <div class="w-1-6 text-xs mr-2 text-gray-700">IMPACT</div>
            <div class="w-5-6 pl-2 break-words text-xs">
                <pre>{{impact}}</pre>
            </div>
        </div>

        {{#if httpRequest}}
        <div class="flex w-full my-6 pb-3 border-b-2 border-gray-200 text-xs">
            <div class="w-1-6 text-xs mr-2 text-gray-700">HTTP REQUEST</div>
            <div class="w-5-6 p-2 break-words text-xs" style="background-color: rgb(237, 242, 247);">
                <pre>{{httpRequest}}</pre>
            </div>
        </div>
        {{/if}}

        <div class="flex w-full my-6 pb-3 border-b-2 border-gray-200 text-xs">
            <div class="w-1-6 text-xs mr-2 text-gray-700">SUGGESTED FIX</div>
            <div class="w-5-6 pl-2 break-words text-xs">
                <pre>{{recommendation}}</pre>
            </div>
        </div>

        <div style="page-break-after: always;"></div>
        {{/each}}
    </div>
</body>
</html>`;

const TEMPLATE_VARIABLES = [
  {
    name: "report_title",
    description: "Main title of the penetration testing report",
    type: "string",
    required: true,
    example: "Vulnerability Assessment and Penetration Testing Report"
  },
  {
    name: "company_name",
    description: "Name of the client company",
    type: "string",
    required: true,
    example: "ACME Corporation"
  },
  {
    name: "application_type",
    description: "Type of application being tested",
    type: "string",
    required: true,
    example: "Web Application"
  },
  {
    name: "organization_name",
    description: "Name of the testing organization",
    type: "string",
    required: true,
    example: "AppSecure"
  },
  {
    name: "current_year",
    description: "Current year for copyright notice",
    type: "string",
    required: true,
    example: "2024"
  },
  {
    name: "test_scope",
    description: "Array of URLs/applications that were tested",
    type: "array",
    required: true,
    example: ["https://www.acme.com"]
  },
  {
    name: "test_time",
    description: "Date when the test was performed",
    type: "string",
    required: true,
    example: "Tue May 23 2024 11:15:40 GMT+0000 (UTC)"
  },
  {
    name: "testers",
    description: "Array of testers with name and role properties",
    type: "array",
    required: false,
    example: [{"name": "John Doe", "role": "Senior Security Researcher"}]
  },
  {
    name: "executive_summary", 
    description: "Executive summary of the assessment",
    type: "string",
    required: true,
    example: "This report summarizes the findings from the security assessment..."
  },
  {
    name: "coverage_asset_type",
    description: "Type of asset being tested (web application, mobile app, etc.)",
    type: "string",
    required: true,
    example: "web application"
  },
  {
    name: "assumptions",
    description: "Assumptions and constraints for the testing",
    type: "string",
    required: true,
    example: "Testing was performed with provided user accounts..."
  },
  {
    name: "findings",
    description: "Array of security findings/vulnerabilities",
    type: "array",
    required: true,
    example: [{
      "title": "SQL Injection in Login Form",
      "description": "The application is vulnerable to SQL injection...",
      "severity": "high",
      "type": "Input Validation",
      "cvssScore": "8.1",
      "cvssVector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N",
      "stepsToReproduce": "1. Navigate to login page...",
      "impact": "An attacker could extract sensitive data...",
      "httpRequest": "POST /login HTTP/1.1...",
      "recommendation": "Use parameterized queries...",
      "screenshots": ["https://example.com/screenshot1.png"],
      "status": "Open"
    }]
  }
];

export async function createDefaultVAPTTemplate(organizationId: string, createdBy: string) {
  console.log("Creating default VAPT template...");
  
  try {
    const template = await storage.createTemplate({
      name: "Professional VAPT Report Template",
      description: "Comprehensive vulnerability assessment and penetration testing report template with OWASP security checklist, executive summary, methodology, and detailed findings sections.",
      type: "html" as const,
      content: DEFAULT_VAPT_TEMPLATE_HTML,
      variables: TEMPLATE_VARIABLES,
      organizationId,
      isDefault: true,
      version: 1,
      createdBy
    });
    
    console.log("Default VAPT template created successfully:", template.id);
    return template;
  } catch (error) {
    console.error("Error creating default VAPT template:", error);
    throw error;
  }
}

// Export for use in other files
export { DEFAULT_VAPT_TEMPLATE_HTML, TEMPLATE_VARIABLES };