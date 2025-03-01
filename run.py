from audit_tarcker import create_App
import os
app = create_App()

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))  # Use Render’s assigned port
    app.run(host="0.0.0.0", port=port, debug=False)