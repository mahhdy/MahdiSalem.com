/**
 * Mermaid diagram interaction script.
 * Handles: Pan, Zoom, Toolbar controls, and Auto-collapse.
 */

class MermaidInteract {
    private wrapper: HTMLElement;
    private container: HTMLElement;
    private svg: SVGSVGElement | null = null;
    private state = {
        zoom: 1,
        translateX: 0,
        translateY: 0,
        isPanning: false,
        lastMousePos: { x: 0, y: 0 },
        panEnabled: false
    };

    constructor(wrapper: HTMLElement) {
        this.wrapper = wrapper;
        this.container = wrapper.querySelector('.mermaid') as HTMLElement;
        this.svg = this.container.querySelector('svg');
        this.init();
    }

    private init() {
        if (!this.svg) {
            // If svg isn't rendered yet (mermaid.js is slow), retry
            setTimeout(() => {
                this.svg = this.container.querySelector('svg');
                if (this.svg) this.setupEvents();
            }, 1000);
            return;
        }
        this.setupEvents();
    }

    private setupEvents() {
        if (!this.svg) return;

        const zoomSlider = this.wrapper.querySelector('.mermaid-zoom-slider') as HTMLInputElement;
        const panBtn = this.wrapper.querySelector('.pan-btn') as HTMLElement;
        const resetBtn = this.wrapper.querySelector('.reset-btn') as HTMLElement;
        const zoomBtn = this.wrapper.querySelector('.zoom-btn') as HTMLElement;
        const expandBtn = this.wrapper.querySelector('.expand-btn') as HTMLElement;

        // 1. Zoom Slider
        if (zoomSlider) {
            zoomSlider.addEventListener('input', (e) => {
                this.state.zoom = parseFloat((e.target as HTMLInputElement).value);
                this.applyTransform();
            });
        }

        // 2. Pan Toggle
        if (panBtn) {
            panBtn.addEventListener('click', () => {
                this.state.panEnabled = !this.state.panEnabled;
                panBtn.classList.toggle('active', this.state.panEnabled);
                this.container.style.cursor = this.state.panEnabled ? 'grab' : 'auto';
            });
        }

        // 3. Reset
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.state.zoom = 1;
                this.state.translateX = 0;
                this.state.translateY = 0;
                if (zoomSlider) zoomSlider.value = "1";
                this.applyTransform();
            });
        }

        // 4. Full Screen
        if (zoomBtn) {
            zoomBtn.addEventListener('click', () => this.toggleFullScreen());
        }

        // 5. Expand/Collapse
        if (expandBtn) {
            expandBtn.addEventListener('click', () => {
                this.wrapper.classList.toggle('is-collapsed');
                expandBtn.textContent = this.wrapper.classList.contains('is-collapsed') ? '↕️' : '🔼';
            });
        }

        // 6. Mouse Events for Panning
        this.container.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseup', () => this.handleMouseUp());

        // 7. Scroll Zoom (Optional, can be annoying if not handled with Ctrl)
        this.container.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                this.state.zoom = Math.min(Math.max(0.2, this.state.zoom + delta), 5);
                if (zoomSlider) zoomSlider.value = this.state.zoom.toString();
                this.applyTransform();
            }
        }, { passive: false });
    }

    private handleMouseDown(e: MouseEvent) {
        if (!this.state.panEnabled) return;
        this.state.isPanning = true;
        this.state.lastMousePos = { x: e.clientX, y: e.clientY };
        this.container.style.cursor = 'grabbing';
    }

    private handleMouseMove(e: MouseEvent) {
        if (!this.state.isPanning) return;
        const dx = e.clientX - this.state.lastMousePos.x;
        const dy = e.clientY - this.state.lastMousePos.y;
        this.state.translateX += dx;
        this.state.translateY += dy;
        this.state.lastMousePos = { x: e.clientX, y: e.clientY };
        this.applyTransform();
    }

    private handleMouseUp() {
        this.state.isPanning = false;
        if (this.state.panEnabled) {
            this.container.style.cursor = 'grab';
        }
    }

    private applyTransform() {
        if (!this.svg) return;
        this.svg.style.transform = `translate(${this.state.translateX}px, ${this.state.translateY}px) scale(${this.state.zoom})`;
        this.svg.style.transition = this.state.isPanning ? 'none' : 'transform 0.1s ease-out';
        this.svg.style.transformOrigin = 'center center';
    }

    private toggleFullScreen() {
        const modal = document.createElement('div');
        modal.className = 'mermaid-modal';
        modal.innerHTML = `
            <div class="close-modal">&times;</div>
            <div class="mermaid-content">
                ${this.container.innerHTML}
            </div>
        `;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        const closeModal = () => {
            modal.remove();
            document.body.style.overflow = '';
        };

        modal.addEventListener('click', closeModal);
        modal.querySelector('.mermaid-content')?.addEventListener('click', e => e.stopPropagation());
        modal.querySelector('.close-modal')?.addEventListener('click', closeModal);
        
        // Modal content needs interactions too
        const modalContent = modal.querySelector('.mermaid-content') as HTMLElement;
        // In full screen, we let it be scrollable normally, or we could re-attach a full set of tools.
        // For simplicity, we just make it large.
    }
}

// Initialization function
export function initMermaid() {
    const wrappers = document.querySelectorAll('.mermaid-wrapper');
    wrappers.forEach(w => new MermaidInteract(w as HTMLElement));
}

// Handle Page Lifecycle
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initMermaid);
}
