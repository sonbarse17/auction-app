import logging
import sys
from app.config.settings import settings

def setup_logging():
    """Configure logging for the application."""
    log_level = settings.log_level.upper()
    
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # Set lower log level for some noisy libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
