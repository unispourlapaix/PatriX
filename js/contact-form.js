/**
 * Contact Form Manager
 * Gère le formulaire de contact avec envoi sécurisé
 */

class ContactFormManager {
    constructor() {
        this.modal = document.getElementById('contactModal');
        this.form = document.getElementById('contactForm');
        this.cancelBtn = document.getElementById('cancelContactBtn');
        this.messageDisplay = document.getElementById('contactFormStatus');
        this.selectedEmoticon = '';
        this.API_KEY = 'd65fa928-ebd2-48ab-8cbe-88122d3b067e';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Délégation pour boutons dynamiques
        document.addEventListener('click', (e) => {
            if (e.target.id === 'contactBtn' || e.target.closest('#contactBtn')) {
                this.openModal();
            }
        });
        
        // Fermeture
        this.cancelBtn?.addEventListener('click', () => this.closeModal());
        this.modal?.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
        
        // Émoticônes
        document.querySelectorAll('.emoticon-btn').forEach(btn => {
            btn.addEventListener('click', () => this.selectEmoticon(btn));
        });
        
        // Soumission
        this.form?.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Échap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal?.classList.contains('active')) {
                this.closeModal();
            }
        });
    }

    openModal() {
        this.modal?.classList.add('active');
        this.resetForm();
        this.hideMessage();
        
        // Focus automatique sur le premier champ
        setTimeout(() => {
            const subjectInput = document.getElementById('contactSubject');
            if (subjectInput) {
                subjectInput.focus();
            }
        }, 100);
    }

    closeModal() {
        this.modal?.classList.remove('active');
    }

    resetForm() {
        this.form?.reset();
        this.selectedEmoticon = '';
        document.querySelectorAll('.emoticon-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }

    selectEmoticon(btn) {
        document.querySelectorAll('.emoticon-btn').forEach(b => {
            b.classList.remove('selected');
        });
        btn.classList.add('selected');
        this.selectedEmoticon = btn.dataset.emoticon || '';
    }

    getFormData() {
        const subject = document.getElementById('contactSubject')?.value?.trim() || '';
        const message = document.getElementById('contactMessageText')?.value?.trim() || '';
        return { subject, message };
    }

    validateForm(subject, message) {
        if (!subject || !message) {
            this.showMessage('error', window.i18n?.t('footer.error') || 'Veuillez remplir tous les champs');
            return false;
        }
        return true;
    }

    setSubmitButtonState(isLoading) {
        const submitBtn = this.form?.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = isLoading;
            submitBtn.textContent = isLoading ? '⏳' : '✉️';
        }
    }

    async sendEmail(subject, message) {
        const formData = new FormData();
        formData.append('access_key', this.API_KEY);
        formData.append('subject', subject + (this.selectedEmoticon ? ' ' + this.selectedEmoticon : ''));
        formData.append('message', message);
        formData.append('from_name', 'PatriX Game Contact');
        
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });
        
        return await response.json();
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const { subject, message } = this.getFormData();
        
        if (!this.validateForm(subject, message)) {
            return;
        }
        
        this.setSubmitButtonState(true);
        
        try {
            const result = await this.sendEmail(subject, message);
            
            if (result.success) {
                this.showMessage('success', window.i18n?.t('footer.success') || 'Message envoyé avec succès ! ✅');
                this.resetForm();
                setTimeout(() => this.closeModal(), 2000);
            } else {
                throw new Error(result.message || 'Erreur lors de l\'envoi');
            }
        } catch (error) {
            console.error('Erreur envoi:', error);
            this.showMessage('error', window.i18n?.t('footer.error') || 'Erreur lors de l\'envoi. Réessayez.');
        } finally {
            this.setSubmitButtonState(false);
        }
    }

    showMessage(type, text) {
        if (!this.messageDisplay) return;
        this.messageDisplay.className = `form-message ${type}`;
        this.messageDisplay.textContent = text;
        this.messageDisplay.style.display = 'block';
    }

    hideMessage() {
        if (this.messageDisplay) {
            this.messageDisplay.style.display = 'none';
        }
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    window.contactFormManager = new ContactFormManager();
});
