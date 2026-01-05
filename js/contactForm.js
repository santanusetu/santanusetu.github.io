/**
 * Contact Form Handler
 * Uses Formspree for static site form submission
 * Sign up at https://formspree.io and replace 'YOUR_FORM_ID' with your form endpoint
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        formspreeEndpoint: 'https://formspree.io/f/YOUR_FORM_ID',
        directEmail: 'santanu.setu@gmail.com'
    };

    // Helper function to get first name from full name
    function getFirstName(fullName) {
        if (!fullName) return '';
        const nameParts = fullName.trim().split(' ');
        return nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : nameParts[0];
    }

    // Helper function to show alert message
    function showAlert(type, message) {
        const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
        const icon = type === 'success' ? '<i class="fa fa-check-circle"></i>' : '<i class="fa fa-exclamation-circle"></i>';
        
        $('#success').html(`
            <div class="alert ${alertClass} alert-dismissible fade in" role="alert">
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                ${icon} <strong>${message}</strong>
            </div>
        `);
        
        // Auto-dismiss after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(function() {
                $('.alert').fadeOut('slow', function() {
                    $(this).remove();
                });
            }, 5000);
        }
    }

    // Helper function to clear form
    function clearForm() {
        $('#contactForm')[0].reset();
        $('.form-group').removeClass('has-error has-success');
        $('.help-block').text('');
    }

    // Helper function to validate email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Initialize form validation and submission
    $(document).ready(function() {
        const $form = $('#contactForm');
        const $submitBtn = $form.find('button[type="submit"]');
        const originalBtnText = $submitBtn.html();
        
        // Native HTML5 validation with custom styling
        $form.on('submit', function(e) {
            e.preventDefault();
            
            // Check native HTML5 validity
            if (!this.checkValidity()) {
                // Show native validation messages
                $(this).find(':invalid').first().focus();
                return false;
            }
            
            // Get form values
            const formData = {
                name: $("input#name").val().trim(),
                email: $("input#email").val().trim(),
                phone: $("input#phone").val().trim(),
                message: $("textarea#message").val().trim()
            };

            // Additional validation
            if (!formData.name || !formData.email || !formData.message) {
                showAlert('danger', 'Please fill in all required fields.');
                return false;
            }

            if (!isValidEmail(formData.email)) {
                showAlert('danger', 'Please enter a valid email address.');
                $("input#email").focus();
                return false;
            }

            // Disable submit button to prevent double submission
            $submitBtn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> Sending...');

            // Get first name for personalized message
            const firstName = getFirstName(formData.name);

            // Submit to Formspree
            $.ajax({
                url: CONFIG.formspreeEndpoint,
                type: "POST",
                data: {
                    name: formData.name,
                    phone: formData.phone,
                    _replyto: formData.email,
                    email: formData.email,
                    message: formData.message,
                    _subject: `Portfolio Contact Form: ${formData.name}`,
                    _format: 'plain'
                },
                dataType: "json",
                cache: false,
                timeout: 10000, // 10 second timeout
                success: function(response) {
                    showAlert('success', 
                        `Thank you ${firstName}! Your message has been sent successfully. I'll get back to you soon.`
                    );
                    clearForm();
                },
                error: function(xhr, status, error) {
                    let errorMessage = `Sorry ${firstName}, there was an error sending your message. `;
                    
                    if (status === 'timeout') {
                        errorMessage += 'The request timed out. ';
                    } else if (xhr.status === 429) {
                        errorMessage += 'Too many requests. Please try again later. ';
                    } else if (xhr.status === 0) {
                        errorMessage += 'Network error. Please check your connection. ';
                    }
                    
                    errorMessage += `Alternatively, you can contact me directly at <a href="mailto:${CONFIG.directEmail}">${CONFIG.directEmail}</a>.`;
                    
                    showAlert('danger', errorMessage);
                },
                complete: function() {
                    // Re-enable submit button
                    $submitBtn.prop('disabled', false).html(originalBtnText);
                }
            });
            
            return false;
        });

        // Tab navigation
        $("a[data-toggle=\"tab\"]").on('click', function(e) {
            e.preventDefault();
            $(this).tab("show");
        });

        // Clear success/error messages when user starts typing
        $('#name, #email, #phone, #message').on('focus', function() {
            $('#success').html('');
        });

        // Real-time validation feedback
        $form.find('input, textarea').on('blur', function() {
            const $field = $(this);
            const $formGroup = $field.closest('.form-group');
            const $helpBlock = $formGroup.find('.help-block');
            
            // Check HTML5 validity
            if (this.checkValidity()) {
                $formGroup.removeClass('has-error').addClass('has-success');
                $helpBlock.text('');
            } else {
                $formGroup.removeClass('has-success').addClass('has-error');
                // Show custom message if available, otherwise show native message
                const customMessage = $field.data('validation-required-message') || this.validationMessage;
                $helpBlock.text(customMessage);
            }
        });
        
        // Clear validation on input
        $form.find('input, textarea').on('input', function() {
            const $field = $(this);
            const $formGroup = $field.closest('.form-group');
            if (this.checkValidity()) {
                $formGroup.removeClass('has-error');
                $formGroup.find('.help-block').text('');
            }
        });
    });
})();
