/**
 * TikZ Diagram Handler
 * تبدیل نمودارهای TikZ به فرمت‌های Astro-compatible
 * 
 * استراتژی:
 * 1. سادہ نمودارات → Mermaid
 * 2. پیچیدہ نمودارات → SVG (از طریق PDF)
 * 3. ناشناخته → تبصره HTML
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import crypto from 'crypto';

export class TikZHandler {
    constructor(options = {}) {
        this.outputDir = options.outputDir || 'public/diagrams';
        this.cacheDir = options.cacheDir || '.tikz-cache';
        this.texPrelude = options.texPrelude || this.getDefaultPrelude();
        
        this.stats = {
            converted: 0,
            cached: 0,
            failed: 0,
            skipped: 0
        };
    }

    /**
     * تشخیص نوع نمودار TikZ
     */
    detectDiagramType(tikzCode) {
        const lowerCode = tikzCode.toLowerCase();
        
        if (lowerCode.includes('mindmap')) return 'mindmap';
        if (lowerCode.includes('tree')) return 'tree';
        if (lowerCode.includes('matrix')) return 'matrix';
        if (lowerCode.includes('automata') || lowerCode.includes('state')) return 'automata';
        if (lowerCode.includes('flowchart') || lowerCode.includes('flow')) return 'flowchart';
        if (lowerCode.includes('graph') && lowerCode.includes('tikz')) return 'graph';
        if (lowerCode.includes('node') && lowerCode.includes('draw')) return 'complex';
        
        return 'unknown';
    }

    /**
     * حاصل کریں کہ آیا TikZ کو Mermaid میں تبدیل کیا جا سکتا ہے
     */
    canConvertToMermaid(tikzCode) {
        const type = this.detectDiagramType(tikzCode);
        const complexity = this.assessComplexity(tikzCode);
        
        // سادہ نمودارات کی Mermaid میں تبدیلی
        return (type === 'tree' || type === 'flowchart' || type === 'mindmap') 
            && complexity < 0.6;
    }

    /**
     * تعقید کی سطح کا تشخیص (0-1)
     */
    assessComplexity(tikzCode) {
        let score = 0;
        
        // شمار نوڈز
        const nodeCount = (tikzCode.match(/\\node/g) || []).length;
        score += Math.min(nodeCount / 20, 0.3);
        
        // شمار کسٹم کمانڈز
        const customCmds = (tikzCode.match(/\\[a-z]+/g) || []).length;
        score += Math.min(customCmds / 50, 0.3);
        
        // شامل رنگ اور سٹائل
        if (tikzCode.includes('draw') || tikzCode.includes('fill')) score += 0.2;
        if (tikzCode.includes('gradient')) score += 0.2;
        
        return Math.min(score, 1);
    }

    /**
     * TikZ کو Mermaid میں تبدیل کریں (سادہ نمودارات)
     */
    convertToMermaid(tikzCode, type) {
        // بہت بنیادی تبدیلی
        // اگر مکمل تبدیلی درکار ہو تو LLM استعمال کریں
        
        switch (type) {
            case 'tree':
                return this.convertTreeToMermaid(tikzCode);
            case 'flowchart':
                return this.convertFlowchartToMermaid(tikzCode);
            default:
                return null;
        }
    }

    convertTreeToMermaid(tikzCode) {
        // بہت سادہ نمودہ
        // مکمل تبدیلی کے لیے LLM ضروری ہے
        const hasRoot = /root|parent/.test(tikzCode);
        if (!hasRoot) return null;

        let mermaid = 'graph TD\n';
        
        // نوڈز نکالیں
        const nodeRegex = /\\node.*?\{([^}]+)\}/g;
        let match;
        let nodeCount = 0;
        
        while ((match = nodeRegex.exec(tikzCode)) !== null) {
            const label = match[1].trim();
            mermaid += `    Node${nodeCount}["${label}"]\n`;
            nodeCount++;
        }
        
        return mermaid;
    }

    convertFlowchartToMermaid(tikzCode) {
        // بہت سادہ نمودہ
        let mermaid = 'graph TD\n';
        
        // نوڈز نکالیں
        const nodeRegex = /\\node.*?\{([^}]+)\}/g;
        let match;
        let nodeCount = 0;
        
        while ((match = nodeRegex.exec(tikzCode)) !== null) {
            const label = match[1].trim();
            mermaid += `    Node${nodeCount}["${label}"]\n`;
            nodeCount++;
        }
        
        return mermaid;
    }

    /**
     * TikZ کو SVG میں تبدیل کریں (پیچیدہ نمودارات)
     */
    async convertToSVG(tikzCode, name) {
        // یہ باہری عمل میں pdflatex + pdf2svg استعمال کرتا ہے
        // ابھی ہمارے پاس یہ دستیاب نہیں ہے
        
        // بدل:
        // 1. ایک Base64 encoded SVG placeholder واپس کریں
        // 2. یا کلائنٹ-سائڈ rendering استعمال کریں
        
        return this.createPlaceholderSVG(name, tikzCode);
    }

    /**
     * TikZ کے لیے placeholder SVG بنائیں
     */
    createPlaceholderSVG(name, tikzCode) {
        const hash = crypto.createHash('md5').update(tikzCode).digest('hex').slice(0, 8);
        
        const svg = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .tikz-placeholder { font-family: monospace; fill: #666; }
      .tikz-frame { stroke: #ddd; stroke-width: 1; fill: none; }
      .tikz-text { font-size: 12px; }
    </style>
  </defs>
  <rect class="tikz-frame" width="300" height="200" x="0" y="0"/>
  <text class="tikz-placeholder tikz-text" x="10" y="30">[TikZ Diagram]</text>
  <text class="tikz-placeholder tikz-text" x="10" y="55" font-size="11">${name}</text>
  <text class="tikz-placeholder tikz-text" x="10" y="80" font-size="10">(${hash})</text>
  <text class="tikz-placeholder tikz-text" x="10" y="110" font-size="10">
    TikZ rendering requires:
  </text>
  <text class="tikz-placeholder tikz-text" x="10" y="130" font-size="10">
    - pdflatex installed
  </text>
  <text class="tikz-placeholder tikz-text" x="10" y="150" font-size="10">
    - pdf2svg converter
  </text>
</svg>`;

        return svg;
    }

    /**
     * MDX میں من TikZ حاصل کریں
     */
    extractTikZFromMDX(content) {
        const tikzRegex = /```tikz([\s\S]*?)```/g;
        const diagrams = [];
        let match;
        
        while ((match = tikzRegex.exec(content)) !== null) {
            diagrams.push({
                code: match[1].trim(),
                fullMatch: match[0]
            });
        }
        
        return diagrams;
    }

    /**
     * MDX میں TikZ کو Mermaid یا SVG سے بدلیں
     */
    async replaceTikZInMDX(content) {
        const diagrams = this.extractTikZFromMDX(content);
        let result = content;
        
        for (let i = 0; i < diagrams.length; i++) {
            const diagram = diagrams[i];
            const type = this.detectDiagramType(diagram.code);
            const name = `tikz-diagram-${i + 1}`;
            
            let replacement = '';
            
            // اگر Mermaid میں تبدیل کیا جا سکتا ہے
            if (this.canConvertToMermaid(diagram.code)) {
                const mermaid = this.convertToMermaid(diagram.code, type);
                if (mermaid) {
                    replacement = `\`\`\`mermaid\n${mermaid}\n\`\`\``;
                    this.stats.converted++;
                }
            }
            
            // ورنہ SVG استعمال کریں
            if (!replacement) {
                const svg = await this.convertToSVG(diagram.code, name);
                replacement = `${svg}`;
                this.stats.converted++;
            }
            
            // اگر کوئی تبدیلی نہیں ہو سکی تو HTML comment رکھیں
            if (!replacement) {
                replacement = `<!-- TikZ diagram: ${name} (type: ${type}) - requires manual conversion -->`;
                this.stats.skipped++;
            }
            
            result = result.replace(diagram.fullMatch, replacement);
        }
        
        return result;
    }

    /**
     * ڈیفالٹ LaTeX prelude
     */
    getDefaultPrelude() {
        return `\\documentclass{article}
\\usepackage{tikz}
\\usetikzlibrary{shapes,arrows,positioning,mindmap,trees}
\\begin{document}`;
    }

    /**
     * آمار حاصل کریں
     */
    getStats() {
        return {
            ...this.stats
        };
    }

    /**
     * آمار دوبارہ معین کریں
     */
    reset() {
        this.stats = {
            converted: 0,
            cached: 0,
            failed: 0,
            skipped: 0
        };
    }
}

export default TikZHandler;
