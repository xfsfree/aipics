document.addEventListener('DOMContentLoaded', function() {
    const stripe = Stripe('YOUR_STRIPE_PUBLIC_KEY');
    
    const modal = document.getElementById('checkoutModal');
    const closeBtn = document.querySelector('.close-btn');
    const buyButtons = document.querySelectorAll('.buy-btn');
    const checkoutForm = document.getElementById('checkoutForm');
    
    buyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const price = this.getAttribute('data-price');
            const product = this.getAttribute('data-product');
            
            document.getElementById('productPrice').value = price;
            document.getElementById('productName').value = product;
            
            modal.style.display = 'block';
        });
    });
    
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        let isValid = true;
        const requiredFields = ['firstName', 'lastName', 'email', 'address'];
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const errorMessage = field.parentElement.querySelector('.error-message');
            
            if (!field.value.trim()) {
                field.classList.add('shake');
                errorMessage.textContent = 'This field is required';
                errorMessage.style.display = 'block';
                isValid = false;
                
                setTimeout(() => {
                    field.classList.remove('shake');
                }, 500);
            } else if (fieldId === 'email' && !/^\S+@\S+\.\S+$/.test(field.value)) {
                field.classList.add('shake');
                errorMessage.textContent = 'Please enter a valid email';
                errorMessage.style.display = 'block';
                isValid = false;
                
                setTimeout(() => {
                    field.classList.remove('shake');
                }, 500);
            } else {
                errorMessage.style.display = 'none';
            }
        });
        
        if (isValid) {
            const price = document.getElementById('productPrice').value;
            const product = document.getElementById('productName').value;
            const email = document.getElementById('email').value;
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const address = document.getElementById('address').value;
            const notes = document.getElementById('notes').value;
            
            fetch('/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    price: price,
                    product: product,
                    customer_email: email,
                    customer_name: `${firstName} ${lastName}`,
                    customer_address: address,
                    notes: notes
                }),
            })
            .then(response => response.json())
            .then(session => {
                return stripe.redirectToCheckout({ sessionId: session.id });
            })
            .then(result => {
                if (result.error) {
                    alert(result.error.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    });
});
