import re

with open('src/context/AppContext.tsx', 'r') as f:
    text = f.read()

import_statement = "import { initAuth, getAccessToken, googleSignIn, logout as googleLogout } from '../lib/googleAuth';\n"
text = text.replace("import { PredefinedReason, Situation, User, Team, Period, Role } from '../types';", import_statement + "import { PredefinedReason, Situation, User, Team, Period, Role } from '../types';")

use_effect = """  useEffect(() => {
    localStorage.setItem('appState', JSON.stringify(state));
  }, [state]);
  
  useEffect(() => {
    const unsubscribe = initAuth();
    return () => unsubscribe();
  }, []);
"""
text = text.replace("  useEffect(() => {\n    localStorage.setItem('appState', JSON.stringify(state));\n  }, [state]);", use_effect)

logout_statement = """  const logout = () => {
    googleLogout();
    setState((prev) => ({ ...prev, currentUser: null }));
  };
"""
text = text.replace("  const logout = () => {\n    setState((prev) => ({ ...prev, currentUser: null }));\n  };", logout_statement)


with open('src/context/AppContext.tsx', 'w') as f:
    f.write(text)
