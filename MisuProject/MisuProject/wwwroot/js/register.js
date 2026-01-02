Api_Url = "api/auth/register"
// Password toggle functionality
document.addEventListener("DOMContentLoaded", () => {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    togglePassword.addEventListener('click', function () {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    toggleConfirmPassword.addEventListener('click', function () {
        const type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
        confirmPasswordInput.type = type;
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    // Form validation and submission
    const registerForm = document.getElementById('registerForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const loading = document.getElementById('loading');
    const successMessage = document.getElementById('successMessage');

    // Real-time validation
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const phoneNumber = document.getElementById('phoneNumber');
    const profession = document.getElementById('profession');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    // Email validation
    email.addEventListener('blur', function () {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.value)) {
            showError('email', 'Please enter a valid email address');
        } else {
            clearError('email');
        }
    });

    // Phone validation
    phoneNumber.addEventListener('blur', function () {
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (this.value.length < 10 || !phoneRegex.test(this.value)) {
            showError('phone', 'Please enter a valid phone number');
        } else {
            clearError('phone');
        }
    });

    // Password validation
    password.addEventListener('blur', function () {
        if (this.value.length < 8) {
            showError('password', 'Password must be at least 8 characters');
        } else {
            clearError('password');
        }
    });

    // Confirm password validation
    confirmPassword.addEventListener('blur', function () {
        if (this.value !== password.value) {
            showError('confirmPassword', 'Passwords do not match');
        } else {
            clearError('confirmPassword');
        }
    });

    function showError(field, message) {
        const input = document.getElementById(field === 'phone' ? 'phoneNumber' : field);
        const errorElement = document.getElementById(field + 'Error');
        input.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    function clearError(field) {
        const input = document.getElementById(field === 'phone' ? 'phoneNumber' : field);
        const errorElement = document.getElementById(field + 'Error');
        input.classList.remove('error');
        errorElement.classList.remove('show');
    }

    // Form submission
    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Clear all errors
        document.querySelectorAll('.error-message').forEach(el => el.classList.remove('show'));
        document.querySelectorAll('input, select').forEach(el => el.classList.remove('error'));

        // Validate all fields
        let isValid = true;

        if (name.value.trim().length < 2) {
            showError('name', 'Please enter your full name');
            isValid = false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            showError('email', 'Please enter a valid email address');
            isValid = false;
        }

        if (phoneNumber.value.length < 10) {
            showError('phone', 'Please enter a valid phone number');
            isValid = false;
        }

        if (!profession.value) {
            showError('profession', 'Please select your profession');
            isValid = false;
        }

        if (password.value.length < 8) {
            showError('password', 'Password must be at least 8 characters');
            isValid = false;
        }

        if (password.value !== confirmPassword.value) {
            showError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }

        if (!isValid) return;

        // Show loading state
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        loading.style.display = 'block';

        // Prepare data matching your DTO
        const registerData = {
            Name: name.value.trim(),
            Email: email.value.trim(),
            Password: password.value,
            PhoneNumber: phoneNumber.value.trim(),
            Proffession: profession.value // Note: matches your typo in DTO
        };

        try {
            // Replace with your actual API endpoint
            const response = await fetch(`${Api_Url}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerData)

            });

            const data = await response.json();
            console.log(data)
            if (response.ok) {
                // Show success message
                successMessage.classList.add('show');
                registerForm.reset();

                // Redirect after 2 seconds
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                // Handle error response
                alert(data.message || 'Registration failed. Please try again.');
            }
        }
        catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        }


        finally {
            // Reset button state
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            loading.style.display = 'none';
        }

    }); 
    });
