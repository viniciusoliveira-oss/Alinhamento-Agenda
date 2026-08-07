import re

with open('src/context/AppContext.tsx', 'r') as f:
    content = f.read()

# Replace the state initialization
new_init = """  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('appState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { 
          ...defaultState, 
          currentUser: parsed.currentUser || null,
          roleColors: parsed.roleColors || defaultState.roleColors
        };
      } catch(e) {
        return defaultState;
      }
    }
    return defaultState;
  });"""

content = re.sub(r'  const \[state, setState\] = useState<AppState>\(\(\) => \{.*?  \}\);', new_init, content, flags=re.DOTALL)

# Replace the useEffect for syncing to local storage
new_sync = """  // Sync user state to local storage
  useEffect(() => {
    if (initialLoadDone) {
      localStorage.setItem('appState', JSON.stringify({
        currentUser: state.currentUser,
        roleColors: state.roleColors
      }));
    }
  }, [state.currentUser, state.roleColors, initialLoadDone]);"""

content = re.sub(r'  // Sync state to local storage.*?  }, \[state, initialLoadDone\]\);', new_sync, content, flags=re.DOTALL)

with open('src/context/AppContext.tsx', 'w') as f:
    f.write(content)

