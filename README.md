# Daybook – To-Do Task Manager (React + Django + SQLite)

```
todo_project/
  backend/    Django + Django REST Framework + SQLite (db.sqlite3 is created automatically)
  frontend/   React (Vite) – dashboard UI styled after your reference design (src/styles.css)
```

Features: add / view / edit / delete tasks, Pending/Completed status, filters (All, Pending, Completed, Overdue),
title validation with error messages, search, Low/Medium/High priority, sorting, responsive layout.

---
## 1. Run locally

You need **Python 3.10+** and **Node.js 18+**. Use two terminals.

### Terminal 1 – Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate            # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                # Windows: copy .env.example .env
python manage.py migrate            # creates db.sqlite3 and the tasks table
python manage.py runserver          # http://127.0.0.1:8000
```

### Terminal 2 – Frontend
```bash
cd frontend
npm install
npm run dev                         # http://localhost:5173
```
Open **http://localhost:5173**. (In development Vite forwards `/api` calls to Django on port 8000.)

---
## 2. REST API (backend)
| Method | URL | Purpose |
|---|---|---|
| GET | `/api/tasks/` | List (`?status=`, `?priority=`, `?deadline=YYYY-MM-DD`, `?search=`, `?overdue=1`, `?ordering=priority` or `newest`) |
| POST | `/api/tasks/` | Create |
| GET | `/api/tasks/{id}/` | Retrieve one |
| PUT | `/api/tasks/{id}/` | Full update |
| PATCH | `/api/tasks/{id}/` | Partial update (e.g. `{"status":"completed"}`) |
| DELETE | `/api/tasks/{id}/` | Delete |
| GET | `/api/tasks/stats/` | Counts: all, pending, completed, overdue |

Validation error example (HTTP 400): `{"title": ["Task title cannot be empty."]}`

## 3. Testing
```bash
cd backend
python manage.py test                 # 20 automated API tests
./scripts/api_smoke_test.sh           # 14 curl checks (server must be running)
```

## 4. Next steps (suggested order)
1. Run it locally and add a few tasks.
2. Run the tests.
3. Push the project to a GitHub repository (`.gitignore` files are included).
4. Deploy the backend (section 5), then the frontend (section 6).
5. Put the live links and a few screenshots in your submission.

---
## 5. Deploy the backend – PythonAnywhere (free, keeps SQLite data)

> Why not Render/Railway free tier? Their disks are wiped on restart, so a SQLite file would lose all tasks.
> PythonAnywhere keeps files permanently, which is what SQLite needs.

1. Create a free account at pythonanywhere.com (your username below = `USERNAME`).
2. **Files** tab → upload `todo_project.zip` and unzip it in a Bash console: `unzip todo_project.zip`
   (or `git clone` your GitHub repo).
3. Open a **Bash console**:
   ```bash
   cd ~/todo_project/backend
   python3.12 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env
   nano .env
   ```
   Set these values in `.env`:
   ```
   DJANGO_SECRET_KEY=<long random string>
   DJANGO_DEBUG=False
   DJANGO_ALLOWED_HOSTS=USERNAME.pythonanywhere.com
   CORS_ALLOWED_ORIGINS=https://YOUR-FRONTEND-URL      # fill in after step 6, no trailing slash
   CSRF_TRUSTED_ORIGINS=https://USERNAME.pythonanywhere.com
   ```
   Then:
   ```bash
   python manage.py migrate
   python manage.py collectstatic --noinput
   ```
4. **Web** tab → *Add a new web app* → *Manual configuration* → Python 3.12.
5. On the Web tab set:
   - **Virtualenv**: `/home/USERNAME/todo_project/backend/venv`
   - **Static files**: URL `/static/` → Directory `/home/USERNAME/todo_project/backend/staticfiles`
6. Click the **WSGI configuration file** link, delete everything and paste:
   ```python
   import os, sys
   path = '/home/USERNAME/todo_project/backend'
   if path not in sys.path:
       sys.path.insert(0, path)
   os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
   from django.core.wsgi import get_wsgi_application
   application = get_wsgi_application()
   ```
7. Click **Reload**. Test: `https://USERNAME.pythonanywhere.com/api/tasks/` should return `[]`.

## 6. Deploy the frontend – Vercel (or Netlify)

1. Push the project to GitHub.
2. On vercel.com: **Add New → Project** → import the repo.
3. Set **Root Directory** = `frontend`. Framework preset: **Vite** (build `npm run build`, output `dist`).
4. Add an **Environment Variable**: `VITE_API_URL` = `https://USERNAME.pythonanywhere.com` (no trailing slash).
5. Deploy. You get a link like `https://daybook.vercel.app`.
6. Go back to PythonAnywhere, put that link in `CORS_ALLOWED_ORIGINS` in `.env`, and press **Reload** on the Web tab.

Netlify works the same way: base directory `frontend`, build command `npm run build`, publish directory `frontend/dist`,
same `VITE_API_URL` variable.

## 7. Troubleshooting
- **Page loads but no tasks** – open the browser console. A CORS error means `CORS_ALLOWED_ORIGINS` doesn't exactly match your frontend URL (include `https://`, no trailing slash).
- **DisallowedHost error** – add your domain to `DJANGO_ALLOWED_HOSTS`.
- **Changed `VITE_API_URL`** – redeploy the frontend; it is baked in at build time.
- **/admin has no styling** – run `collectstatic` and check the static files mapping.
