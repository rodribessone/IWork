import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

export default function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") || "";

  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/search?q=${q}`);
      const data = await res.json();
      setUsers(data.users);
      setPosts(data.posts);
      setLoading(false);
    }

    if (q.trim() !== "") {
      fetchResults();
    }
  }, [q]);

  if (loading) return <p className="text-center mt-10">Buscando...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-amber-500">
        Resultados para "{q}"
      </h1>

      {/* Usuarios */}
      <h2 className="text-xl font-semibold mt-6 mb-2 text-white">Usuarios</h2>
      {users.length === 0 && <p className="text-gray-400">No hay usuarios encontrados.</p>}
      <div className="flex flex-col gap-4">
        {users.map((u) => (
          <Link
            key={u._id}
            to={`/users/${u._id}`}
            className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition"
          >
            <img
              src={u.imageUrl || "https://i.imgur.com/UM3mrju.png"}
              alt="profile"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="text-white font-medium">
                {u.name}{" "}
                {u.isVerified && <span className="text-amber-400">✔️</span>}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Posts */}
      <h2 className="text-xl font-semibold mt-8 mb-2 text-white">Publicaciones</h2>
      {posts.length === 0 && <p className="text-gray-400">No hay publicaciones encontradas.</p>}

      <div className="flex flex-col gap-4">
        {posts.map((p) => (
          <Link
            key={p._id}
            to={`/post/${p._id}`}
            className="p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition"
          >
            <h3 className="text-amber-400 font-bold">{p.title}</h3>
            <p className="text-gray-300 text-sm">{p.description.slice(0, 80)}...</p>

            <div className="flex items-center gap-2 mt-2">
              <img
                src={p.user?.imageUrl || "https://i.imgur.com/UM3mrju.png"}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-white">{p.user?.name}</span>
              {p.user?.isVerified && <span className="text-amber-400">✔️</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
