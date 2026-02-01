import uuid

def process_dummy_payment(amount: float):
    # Always "successful" in demo mode
    return {
        "payment_id": str(uuid.uuid4()),
        "status": "success",
        "amount": amount
    }
