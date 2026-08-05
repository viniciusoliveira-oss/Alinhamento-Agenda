import re

with open('src/context/AppContext.tsx', 'r') as f:
    text = f.read()

# Add import for secondary auth
import_stmt = "import { secondaryAuth } from '../lib/firebaseSecondary';\n"
text = text.replace("import { handleFirestoreError, OperationType } from '../lib/firebaseHelper';", "import { handleFirestoreError, OperationType } from '../lib/firebaseHelper';\n" + import_stmt)

# Update addUser
adduser_old = """  const addUser = async (userData: Omit<User, 'id'>) => {
    try {
      // Create user using Firebase Auth API (in a real app, this should be a cloud function to create other users, 
      // but for this example we can't easily. Oh wait, we can't easily create users without signing out the admin)
      // Actually we should create a secondary app or call REST API. But we can just store them in Firestore,
      // and maybe for password we can't do it purely client side without logging out.
      // Wait, there's a trick to use a secondary auth instance, but let's just use standard for now and ignore the auth side complication.
      // We will assume the user handles auth creation outside or we just add to Firestore.
      throw new Error("Creation should be done via Cloud Functions or a secondary app. See implementation details in AppContext.tsx");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'users');
    }
  };"""

adduser_new = """  const addUser = async (userData: Omit<User, 'id'>) => {
    try {
      // Default password is 'Mudar@123'
      // We assume userData.username is actually an email or we use email for auth.
      // Wait, User has username and name. Let's assume username is the email for Firebase.
      const email = userData.username.includes('@') ? userData.username : `${userData.username}@sistema.local`;
      const result = await createUserWithEmailAndPassword(secondaryAuth, email, 'Mudar@123');
      
      const newUser = {
        ...userData,
        username: email, // ensure we store the email used
        id: result.user.uid,
        uid: result.user.uid,
        requirePasswordChange: true
      };
      
      await setDoc(doc(db, 'users', result.user.uid), newUser);
      
      // Sign out the secondary auth so it doesn't stay logged in
      await signOut(secondaryAuth);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'users');
    }
  };"""

text = text.replace(adduser_old, adduser_new)

with open('src/context/AppContext.tsx', 'w') as f:
    f.write(text)
