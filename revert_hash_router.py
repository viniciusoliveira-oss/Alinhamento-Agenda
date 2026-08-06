import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';", "import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';")
content = content.replace("<Router>", "<BrowserRouter>")
content = content.replace("</Router>", "</BrowserRouter>")

with open('src/App.tsx', 'w') as f:
    f.write(content)

