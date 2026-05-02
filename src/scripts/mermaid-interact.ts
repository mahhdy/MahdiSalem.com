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

        // Selectors matching remark-mermaid.mjs
        const zoomInBtn = this.wrapper.querySelector('.mermaid-zoom-in') as HTMLElement;
        const zoomOutBtn = this.wrapper.querySelector('.mermaid-zoom-out') as HTMLElement;
        const resetBtn = this.wrapper.querySelector('.mermaid-reset') as HTMLElement;
        
        // Secondary selectors for other versions/plugins
        const zoomSlider = this.wrapper.querySelector('.mermaid-zoom-slider') as HTMLInputElement;
        const panBtn = this.wrapper.querySelector('.pan-btn') as HTMLElement;
        const legacyResetBtn = this.wrapper.querySelector('.reset-btn') as HTMLElement;
        const zoomBtn = this.wrapper.querySelector('.zoom-btn') as HTMLElement;
        const expandBtn = this.wrapper.querySelector('.expand-btn') as HTMLElement;

        // 1. Zoom Controls
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.updateZoom(this.state.zoom + 0.2);
            });
        }
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.updateZoom(this.state.zoom - 0.2);
            });
        }
        if (zoomSlider) {
            zoomSlider.addEventListener('input', (e) => {
                this.state.zoom = parseFloat((e.target as HTMLInputElement).value);
                this.applyTransform();
            });
        }

        // 2. Pan Toggle
        if (panBtn) {
            panBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.state.panEnabled = !this.state.panEnabled;
                panBtn.classList.toggle('active', this.state.panEnabled);
                this.container.style.cursor = this.state.panEnabled ? 'grab' : 'auto';
            });
        }

        // 3. Reset
        const handleReset = (e: Event) => {
            e.stopPropagation();
            this.resetView();
        };
        if (resetBtn) resetBtn.addEventListener('click', handleReset);
        if (legacyResetBtn) legacyResetBtn.addEventListener('click', handleReset);

        // 4. Full Screen
        if (zoomBtn) {
            zoomBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFullScreen();
            });
        }

        // 5. Expand/Collapse
        const toggleCollapse = () => {
            this.wrapper.classList.toggle('is-collapsed');
            if (expandBtn) {
                expandBtn.textContent = this.wrapper.classList.contains('is-collapsed') ? '↕️' : '🔼';
            }
        };

        if (expandBtn) {
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleCollapse();
            });
        }

        // Also expand on click if collapsed
        this.wrapper.addEventListener('click', (e) => {
            if (this.wrapper.classList.contains('is-collapsed')) {
                toggleCollapse();
            }
        });

        // 6. Mouse Events for Panning
        this.container.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        window.addEventListener('mouseup', () => this.handleMouseUp());

        // 7. Scroll Zoom
        this.container.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                this.updateZoom(this.state.zoom + delta);
            }
        }, { passive: false });

        // Initial Adjustment
        this.adjustInitialView();
    }

    private updateZoom(newZoom: number) {
        this.state.zoom = Math.min(Math.max(0.2, newZoom), 5);
        const zoomSlider = this.wrapper.querySelector('.mermaid-zoom-slider') as HTMLInputElement;
        if (zoomSlider) zoomSlider.value = this.state.zoom.toString();
        this.applyTransform();
    }

    private resetView() {
        this.state.zoom = 1;
        this.state.translateX = 0;
        this.state.translateY = 0;
        const zoomSlider = this.wrapper.querySelector('.mermaid-zoom-slider') as HTMLInputElement;
        if (zoomSlider) zoomSlider.value = "1";
        this.applyTransform();
    }

    private adjustInitialView() {
        // If it's a very wide diagram, we might want to start it with some scroll
        const isWide = this.wrapper.classList.contains('mermaid-type-gantt') ||
            this.wrapper.classList.contains('mermaid-type-timeline');

        if (isWide && this.container) {
            // Center the scroll horizontally initially
            const scrollWidth = this.container.scrollWidth;
            const clientWidth = this.container.clientWidth;
            if (scrollWidth > clientWidth) {
                this.container.scrollLeft = 0; // Start at beginning for timelines
            }
        }
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
        // Apply transform to the SVG content
        this.svg.style.transform = `translate(${this.state.translateX}px, ${this.state.translateY}px) scale(${this.state.zoom})`;
        this.svg.style.transition = this.state.isPanning ? 'none' : 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
        this.svg.style.transformOrigin = 'center center';
    }

    private toggleFullScreen() {
        const modal = document.createElement('div');
        modal.className = 'mermaid-modal interact-active';
        
        // Clone the wrapper structure for the modal to reuse styles and interaction logic
        modal.innerHTML = `
            <div class="close-modal" title="Exit Fullscreen">&times;</div>
            <div class="mermaid-wrapper modal-mode">
                ${this.wrapper.querySelector('.mermaid-toolbar')?.outerHTML || ''}
                <div class="mermaid">
                    ${this.container.innerHTML}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        const modalWrapper = modal.querySelector('.mermaid-wrapper') as HTMLElement;
        const modalSvg = modal.querySelector('svg');
        
        if (modalSvg) {
            modalSvg.style.maxWidth = 'none';
            modalSvg.style.height = 'auto';
            // Start with a reasonable size, allowing user to zoom in
            modalSvg.style.minWidth = '90vw';
        }

        // Initialize a NEW interaction instance for the modal
        if (modalWrapper) {
            new MermaidInteract(modalWrapper);
        }

        const closeModal = () => {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        };

        // Close on click outside (on the modal background)
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        modal.querySelector('.close-modal')?.addEventListener('click', closeModal);

        // Escape key to close
        const escHandler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeModal();
                window.removeEventListener('keydown', escHandler);
            }
        };
        window.addEventListener('keydown', escHandler);
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
    document.addEventListener('mermaid-ready', initMermaid);
}
