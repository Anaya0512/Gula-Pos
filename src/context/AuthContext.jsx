import { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../supabase/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      setUsuario(user);

      if (user) {
        const { data } = await supabase
          .from("usuarios")
          .select("*")
          .eq("id", user.id)
          .single();
        setPerfil(data);
      }

      setCargando(false);
    };

    obtenerSesion();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const user = session?.user || null;
        setUsuario(user);

        if (user) {
          const { data } = await supabase
            .from("usuarios")
            .select("*")
            .eq("id", user.id)
            .single();
          setPerfil(data);
        } else {
          setPerfil(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, perfil, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
