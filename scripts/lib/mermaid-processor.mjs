// lib/mermaid-processor.mjs

export class MermaidProcessor {
    constructor(options = {}) {
        this.stats = { processed: 0, cached: 0, failed: 0 };
    }

    async process(content, options = {}) {
        // فقط بلوک‌های ```mermaid را به فرمت خاص تبدیل کنید
        // که بعداً rehype بتواند آن را پیدا کند

        // هیچ تغییری نمی‌دهیم! بلوک‌های ```mermaid را همان‌طور نگه می‌داریم
        // کار اصلی را rehype plugin انجام می‌دهد

        // فقط آمار می‌گیریم
        const regex = /```mermaid\s*\n([\s\S]*?)```/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            this.stats.processed++;
        }

        return content; // بدون تغییر!
    }

    getStats() {
        return { ...this.stats };
    }
}

export default MermaidProcessor;