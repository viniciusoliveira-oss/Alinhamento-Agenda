import re

with open('src/context/AppContext.tsx', 'r') as f:
    text = f.read()

# Add a function to bootstrap admin if no users exist
effect_old = """    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const users = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as User));
      setState(s => ({ ...s, users }));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'users'));"""

effect_new = """    const unsubUsers = onSnapshot(collection(db, 'users'), async (snapshot) => {
      const users = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as User));
      setState(s => ({ ...s, users }));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'users'));"""

text = text.replace(effect_old, effect_new)

# Wait, the above is for logged in users. 
# But we need to bootstrap BEFORE login, because nobody can login if there are no users.
# So we need to do this in the first useEffect or outside.

bootstrap_code = """
  useEffect(() => {
    // Bootstrap admin if not exists
    const checkBootstrap = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        if (usersSnap.empty) {
          console.log('No users found. Bootstrapping admin...');
          try {
             // Create admin user in secondary auth
             const result = await createUserWithEmailAndPassword(secondaryAuth, 'admin@sistema.local', 'Mudar@123');
             const adminUser: User = {
               id: result.user.uid,
               uid: result.user.uid,
               name: 'Administrador',
               username: 'admin@sistema.local',
               role: 'admin',
               requirePasswordChange: false // Admin can keep it or change it, but let's not force on first bootstrap so they can get in
             };
             await setDoc(doc(db, 'users', result.user.uid), adminUser);
             await signOut(secondaryAuth);
          } catch(e) {
            console.error('Failed to bootstrap admin:', e);
          }
        }
      } catch (e) {
         console.error('Failed to check users for bootstrap:', e);
      }
    };
    checkBootstrap();
  }, []);
"""

text = text.replace("useEffect(() => {\n    const unsubscribe = onAuthStateChanged", bootstrap_code + "\n  useEffect(() => {\n    const unsubscribe = onAuthStateChanged")

with open('src/context/AppContext.tsx', 'w') as f:
    f.write(text)
