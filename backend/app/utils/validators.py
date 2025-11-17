import re

def sanitize_string(value: str, max_length: int = 255) -> str:
    if not value:
        return ""
    value = re.sub(r'<[^>]+>', '', value)
    value = re.sub(r'(--|;|\'|\"|\*|\/\*|\*\/)', '', value)
    return value[:max_length].strip()

def validate_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

def validate_password(password: str) -> tuple[bool, str]:
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain lowercase letter"
    if not re.search(r'[0-9]', password):
        return False, "Password must contain number"
    return True, ""

def validate_amount(amount: int, min_val: int = 0, max_val: int = 1000000000) -> bool:
    return min_val <= amount <= max_val
