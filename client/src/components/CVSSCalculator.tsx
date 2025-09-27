import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { SeverityBadge } from "./SeverityBadge";

interface CVSSCalculatorProps {
  value?: string;
  onChange?: (vector: string, score: number, severity: string) => void;
  disabled?: boolean;
}

const cvssMetrics = {
  AV: {
    label: "Attack Vector",
    options: {
      N: { label: "Network", value: 0.85 },
      A: { label: "Adjacent", value: 0.62 },
      L: { label: "Local", value: 0.55 },
      P: { label: "Physical", value: 0.2 },
    },
  },
  AC: {
    label: "Attack Complexity",
    options: {
      L: { label: "Low", value: 0.77 },
      H: { label: "High", value: 0.44 },
    },
  },
  PR: {
    label: "Privileges Required",
    options: {
      N: { label: "None", value: 0.85 },
      L: { label: "Low", value: 0.62 },
      H: { label: "High", value: 0.27 },
    },
  },
  UI: {
    label: "User Interaction",
    options: {
      N: { label: "None", value: 0.85 },
      R: { label: "Required", value: 0.62 },
    },
  },
  S: {
    label: "Scope",
    options: {
      U: { label: "Unchanged", value: 1.0 },
      C: { label: "Changed", value: 1.0 },
    },
  },
  C: {
    label: "Confidentiality",
    options: {
      H: { label: "High", value: 0.56 },
      L: { label: "Low", value: 0.22 },
      N: { label: "None", value: 0.0 },
    },
  },
  I: {
    label: "Integrity",
    options: {
      H: { label: "High", value: 0.56 },
      L: { label: "Low", value: 0.22 },
      N: { label: "None", value: 0.0 },
    },
  },
  A: {
    label: "Availability",
    options: {
      H: { label: "High", value: 0.56 },
      L: { label: "Low", value: 0.22 },
      N: { label: "None", value: 0.0 },
    },
  },
};

function calculateCVSS(vector: Record<string, string>) {
  const exploitability = 8.22 * 
    (cvssMetrics.AV.options[vector.AV as keyof typeof cvssMetrics.AV.options]?.value || 0) *
    (cvssMetrics.AC.options[vector.AC as keyof typeof cvssMetrics.AC.options]?.value || 0) *
    (cvssMetrics.PR.options[vector.PR as keyof typeof cvssMetrics.PR.options]?.value || 0) *
    (cvssMetrics.UI.options[vector.UI as keyof typeof cvssMetrics.UI.options]?.value || 0);

  const impact = 1 - (
    (1 - (cvssMetrics.C.options[vector.C as keyof typeof cvssMetrics.C.options]?.value || 0)) *
    (1 - (cvssMetrics.I.options[vector.I as keyof typeof cvssMetrics.I.options]?.value || 0)) *
    (1 - (cvssMetrics.A.options[vector.A as keyof typeof cvssMetrics.A.options]?.value || 0))
  );

  let baseScore;
  if (impact <= 0) {
    baseScore = 0;
  } else if (vector.S === 'U') {
    baseScore = Math.min(impact + exploitability, 10);
  } else {
    baseScore = Math.min(1.08 * (impact + exploitability), 10);
  }

  return Math.round(baseScore * 10) / 10;
}

function getSeverity(score: number): "critical" | "high" | "medium" | "low" | "informational" {
  if (score >= 9.0) return "critical";
  if (score >= 7.0) return "high";
  if (score >= 4.0) return "medium";
  if (score >= 0.1) return "low";
  return "informational";
}

function parseVector(vectorString: string) {
  const parts = vectorString.replace('CVSS:3.1/', '').split('/');
  const vector: Record<string, string> = {};
  
  parts.forEach(part => {
    const [key, value] = part.split(':');
    if (key && value) {
      vector[key] = value;
    }
  });
  
  return vector;
}

export function CVSSCalculator({ value, onChange, disabled }: CVSSCalculatorProps) {
  const [vector, setVector] = useState(() => {
    if (value) {
      return parseVector(value);
    }
    return {
      AV: 'N',
      AC: 'L', 
      PR: 'N',
      UI: 'N',
      S: 'U',
      C: 'N',
      I: 'N',
      A: 'N'
    };
  });

  const score = calculateCVSS(vector);
  const severity = getSeverity(score);
  const vectorString = `CVSS:3.1/AV:${vector.AV}/AC:${vector.AC}/PR:${vector.PR}/UI:${vector.UI}/S:${vector.S}/C:${vector.C}/I:${vector.I}/A:${vector.A}`;

  const handleChange = (metric: string, value: string) => {
    const newVector = { ...vector, [metric]: value };
    setVector(newVector);
    
    const newScore = calculateCVSS(newVector);
    const newSeverity = getSeverity(newScore);
    const newVectorString = `CVSS:3.1/AV:${newVector.AV}/AC:${newVector.AC}/PR:${newVector.PR}/UI:${newVector.UI}/S:${newVector.S}/C:${newVector.C}/I:${newVector.I}/A:${newVector.A}`;
    
    onChange?.(newVectorString, newScore, newSeverity);
  };

  return (
    <Card data-testid="cvss-calculator">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>CVSS v3.1 Calculator</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-mono text-sm" data-testid="cvss-score">
              {score.toFixed(1)}
            </Badge>
            <SeverityBadge severity={severity} />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(cvssMetrics).map(([key, metric]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`cvss-${key}`}>{metric.label}</Label>
              <Select
                value={vector[key] || ''}
                onValueChange={(value) => handleChange(key, value)}
                disabled={disabled}
              >
                <SelectTrigger id={`cvss-${key}`} data-testid={`select-cvss-${key.toLowerCase()}`}>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(metric.options).map(([optionKey, option]) => (
                    <SelectItem key={optionKey} value={optionKey}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t">
          <Label>CVSS Vector</Label>
          <div className="mt-1 p-2 bg-muted rounded-md font-mono text-sm break-all" data-testid="cvss-vector">
            {vectorString}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}