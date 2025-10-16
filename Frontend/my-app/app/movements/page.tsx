'use client';
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  PlusCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  Filter,
  Loader2,
  Calendar,
  User,
  FileText,
  Package,
  X,
  Edit,
  Trash
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  reference: string;
  quantity: number;
};

type Movement = {
  id: string;
  product: string;
  product_name: string;
  movement_type: string;
  quantity: number;
  reason: string;
  reference_document: string;
  created_at: string;
  created_by_username: string;
};

type UserType = {
  role: string;
  first_name: string;
  last_name: string;
};

export default function Movements() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
  const [formData, setFormData] = useState({
    product: "",
    movement_type: "in",
    quantity: 0,
    reason: "",
    reference_document: "",
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");
    
    if (!userStr || !token) {
      window.location.href = '/login';
      return;
    }
    
    setUser(JSON.parse(userStr));
    loadData(token);
  }, []);

  const loadData = async (token: string) => {
    try {
      const [movementsRes, productsRes] = await Promise.all([
        fetch('http://localhost:8000/api/movements/', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/api/products/', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (movementsRes.ok && productsRes.ok) {
        setMovements(await movementsRes.json());
        setProducts(await productsRes.json());
      }
    } catch (error) {
      console.error("Erreur chargement données", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.product || formData.quantity <= 0) {
      alert("Veuillez sélectionner un produit et une quantité valide");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const url = editingMovement
        ? `http://localhost:8000/api/movements/${editingMovement.id}/`
        : 'http://localhost:8000/api/movements/';
      
      const response = await fetch(url, {
        method: editingMovement ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadData(token!);
        closeModal();
      } else {
        alert("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur sauvegarde mouvement", error);
      alert("Erreur lors de la sauvegarde");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMovement(null);
    setFormData({
      product: "",
      movement_type: "in",
      quantity: 0,
      reason: "",
      reference_document: "",
    });
  };

  const openModal = (movement?: Movement) => {
    if (movement) {
      setEditingMovement(movement);
      setFormData({
        product: movement.product,
        movement_type: movement.movement_type,
        quantity: movement.quantity,
        reason: movement.reason,
        reference_document: movement.reference_document,
      });
    } else {
      setEditingMovement(null);
      setFormData({
        product: "",
        movement_type: "in",
        quantity: 0,
        reason: "",
        reference_document: "",
      });
    }
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce mouvement ?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://localhost:8000/api/movements/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        await loadData(token!);
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur suppression mouvement", error);
      alert("Erreur lors de la suppression");
    }
  };

  const filteredMovements = filterType
    ? movements.filter((m) => m.movement_type === filterType)
    : movements;

  const canModify = user?.role === "admin" || user?.role === "employee";
  const canDeleteModify = user?.role === "admin";

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#0a1525] via-[#0d2a3d] to-[#1a3d5f]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#87CEEB] animate-spin mx-auto drop-shadow-[0_0_20px_rgba(135,206,235,1)]" />
          <p className="mt-4 text-white text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full flex flex-col bg-gradient-to-br from-[#0a1525] via-[#0d2a3d] to-[#1a3d5f] overflow-hidden">
      {/* Decorative background - Reduced glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-[#87CEEB] rounded-full blur-[140px] opacity-2" style={{animation: 'pulse 12s cubic-bezier(0.4, 0, 0.6, 1) infinite'}}></div>
        <div className="absolute bottom-20 left-20 w-[600px] h-[600px] bg-[#00BFFF] rounded-full blur-[160px] opacity-1" style={{animation: 'pulse 14s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '2s'}}></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gradient-to-b from-[#0a1f2e] via-[#0d2838]/80 to-transparent backdrop-blur-xl border-b border-[#87CEEB]/20 sticky top-0 shadow-[0_4px_20px_rgba(135,206,235,0.15)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1e3a5f] hover:bg-[#2a5080] transition border border-[#87CEEB]/30 shadow-[0_0_15px_rgba(30,58,95,0.6)]"
              >
                <ArrowLeft className="w-5 h-5 text-[#87CEEB]" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white drop-shadow-[0_2px_6px_rgba(135,206,235,0.25)]">
                  Mouvements de Stock
                </h1>
                <p className="text-xs text-[#87CEEB]">Historique des entrées et sorties</p>
              </div>
            </div>
            {canModify && (
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#87CEEB] text-[#0d2838] rounded-xl font-bold hover:shadow-[0_0_12px_rgba(135,206,235,0.4)] active:scale-95 transition-all shadow-[0_0_6px_rgba(135,206,235,0.25)]"
              >
                <PlusCircle className="w-5 h-5" />
                Nouveau mouvement
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full overflow-y-auto flex-1">
        {/* Filters */}
        <div className="bg-black/50 backdrop-blur-xl rounded-2xl shadow-2xl p-5 border border-[#87CEEB]/40 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-[#87CEEB]" />
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setFilterType("")}
                className={`px-5 py-2.5 rounded-xl font-semibold transition ${
                  filterType === ""
                    ? "bg-[#87CEEB] text-[#0d2838] shadow-[0_0_12px_rgba(135,206,235,0.4)]"
                    : "bg-black/40 text-[#87CEEB] hover:bg-black/60 border border-[#87CEEB]/30"
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilterType("in")}
                className={`px-5 py-2.5 rounded-xl font-semibold transition flex items-center gap-2 ${
                  filterType === "in"
                    ? "bg-gradient-to-r from-green-600 to-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                    : "bg-black/40 text-[#87CEEB] hover:bg-black/60 border border-[#87CEEB]/30"
                }`}
              >
                <ArrowUpCircle className="w-4 h-4" />
                Entrées
              </button>
              <button
                onClick={() => setFilterType("out")}
                className={`px-5 py-2.5 rounded-xl font-semibold transition flex items-center gap-2 ${
                  filterType === "out"
                    ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                    : "bg-black/40 text-[#87CEEB] hover:bg-black/60 border border-[#87CEEB]/30"
                }`}
              >
                <ArrowDownCircle className="w-4 h-4" />
                Sorties
              </button>
            </div>
          </div>
        </div>

        {/* Movements Table */}
        <div className="bg-black/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#87CEEB]/40 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/50 border-b border-[#87CEEB]/20">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#87CEEB] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Date
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#87CEEB] uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#87CEEB] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Produit
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-[#87CEEB] uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#87CEEB] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Motif
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#87CEEB] uppercase tracking-wider">
                    Référence
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#87CEEB] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Créé par
                    </div>
                  </th>
                  {canDeleteModify && (
                    <th className="px-6 py-4 text-center text-xs font-bold text-[#87CEEB] uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#87CEEB]/10">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={canDeleteModify ? 8 : 7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-[#1e3a5f] flex items-center justify-center">
                          <ArrowUpCircle className="w-8 h-8 text-[#87CEEB]" />
                        </div>
                        <p className="text-[#87CEEB] font-medium">Aucun mouvement trouvé</p>
                        <p className="text-sm text-[#87CEEB]/60">Les mouvements de stock apparaîtront ici</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-black/30 transition">
                      <td className="px-6 py-4 text-sm text-[#87CEEB]">
                        {formatDate(movement.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        {movement.movement_type === 'in' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-300 border border-green-400/30">
                            <ArrowUpCircle className="w-3.5 h-3.5" />
                            Entrée
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-400/30">
                            <ArrowDownCircle className="w-3.5 h-3.5" />
                            Sortie
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-white">
                        {movement.product_name}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-lg font-bold text-white">
                          {movement.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#87CEEB]">
                        {movement.reason || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#87CEEB]">
                        {movement.reference_document || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#87CEEB]">
                        {movement.created_by_username}
                      </td>
                      {canDeleteModify && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openModal(movement)}
                              className="p-2 text-[#87CEEB] hover:text-white hover:bg-[#1e3a5f] rounded-lg transition"
                              title="Modifier"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(movement.id)}
                              className="p-2 text-white hover:bg-red-500/30 rounded-lg transition"
                              title="Supprimer"
                            >
                              <Trash className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between text-sm">
          <p className="text-[#87CEEB]">
            Affichage de <span className="font-bold text-white">{filteredMovements.length}</span> sur <span className="font-bold text-white">{movements.length}</span> mouvements
          </p>
        </div>
      </main>

      {/* Modal Add/Edit Movement */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#0d2838] to-[#1a3d5f] rounded-2xl shadow-2xl max-w-lg w-full border border-[#87CEEB]/40">
            <div className="border-b border-[#87CEEB]/20 px-6 py-5 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white drop-shadow-[0_2px_6px_rgba(135,206,235,0.25)]">
                {editingMovement ? "Modifier le mouvement" : "Nouveau mouvement"}
              </h3>
              <button
                onClick={closeModal}
                className="text-[#87CEEB] hover:text-white transition p-1 hover:bg-[#1e3a5f] rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Type de mouvement */}
              <div>
                <label className="block text-sm font-semibold text-[#87CEEB] mb-3">
                  Type de mouvement
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, movement_type: "in" })
                    }
                    className={`flex items-center justify-center gap-2 p-4 border-2 rounded-xl transition ${
                      formData.movement_type === "in"
                        ? "border-green-400 bg-green-500/20 text-green-300"
                        : "border-[#87CEEB]/30 hover:border-[#87CEEB]/50 text-[#87CEEB]"
                    }`}
                  >
                    <ArrowUpCircle className="w-5 h-5" />
                    <span className="font-semibold">Entrée</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, movement_type: "out" })
                    }
                    className={`flex items-center justify-center gap-2 p-4 border-2 rounded-xl transition ${
                      formData.movement_type === "out"
                        ? "border-red-400 bg-red-500/20 text-red-300"
                        : "border-[#87CEEB]/30 hover:border-[#87CEEB]/50 text-[#87CEEB]"
                    }`}
                  >
                    <ArrowDownCircle className="w-5 h-5" />
                    <span className="font-semibold">Sortie</span>
                  </button>
                </div>
              </div>

              {/* Produit */}
              <div>
                <label className="block text-sm font-semibold text-[#87CEEB] mb-2">
                  Produit *
                </label>
                <select
                  value={formData.product}
                  onChange={(e) =>
                    setFormData({ ...formData, product: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black/40 border border-[#87CEEB]/30 rounded-xl text-white focus:border-[#87CEEB] focus:outline-none transition"
                  required
                >
                  <option value="" className="bg-[#0d2838]">Sélectionner un produit</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id} className="bg-[#0d2838]">
                      {product.name} (Réf: {product.reference}) - Stock: {product.quantity}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantité */}
              <div>
                <label className="block text-sm font-semibold text-[#87CEEB] mb-2">
                  Quantité *
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-3 bg-black/40 border border-[#87CEEB]/30 rounded-xl text-white focus:border-[#87CEEB] focus:outline-none transition"
                  min="1"
                  required
                />
              </div>

              {/* Motif */}
              <div>
                <label className="block text-sm font-semibold text-[#87CEEB] mb-2">
                  Motif
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  rows={2}
                  className="w-full px-4 py-3 bg-black/40 border border-[#87CEEB]/30 rounded-xl text-white focus:border-[#87CEEB] focus:outline-none transition resize-none"
                  placeholder="Ex: Réapprovisionnement, Commande client..."
                />
              </div>

              {/* Référence document */}
              <div>
                <label className="block text-sm font-semibold text-[#87CEEB] mb-2">
                  Référence document
                </label>
                <input
                  type="text"
                  value={formData.reference_document}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reference_document: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 bg-black/40 border border-[#87CEEB]/30 rounded-xl text-white focus:border-[#87CEEB] focus:outline-none transition"
                  placeholder="Ex: BL-2024-001, CMD-123..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  className={`flex-1 py-3 rounded-xl font-bold transition shadow-[0_0_6px_rgba(135,206,235,0.25)] ${
                    formData.movement_type === "in"
                      ? "bg-green-500 hover:shadow-[0_0_12px_rgba(34,197,94,0.4)] text-white"
                      : "bg-red-500 hover:shadow-[0_0_12px_rgba(220,38,38,0.4)] text-white"
                  }`}
                >
                  {editingMovement ? "Modifier" : "Enregistrer"}
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 bg-black/40 text-[#87CEEB] py-3 rounded-xl hover:bg-black/60 transition font-semibold border border-[#87CEEB]/30"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}