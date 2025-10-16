'use client';
import { useEffect, useState } from "react";
import {
  Package,
  PlusCircle,
  Search,
  Edit,
  Trash,
  ArrowLeft,
  Filter,
  Loader2,
  X,
  DollarSign,
  MapPin,
  Hash,
  FileText
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  description: string;
  reference: string;
  quantity: number;
  min_quantity: number;
  unit_price: number;
  category: string;
  location: string;
  total_value: number;
  created_at: string;
  created_by_username: string;
};

type User = {
  role: string;
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    reference: "",
    quantity: 0,
    min_quantity: 10,
    unit_price: 0,
    category: "",
    location: "",
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("access_token");
    
    if (!userStr || !token) {
      window.location.href = '/login';
      return;
    }
    
    setUser(JSON.parse(userStr));
    loadProducts(token);
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const loadProducts = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/products/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        setFilteredProducts(data);
      } else if (response.status === 401) {
        localStorage.clear();
        window.location.href = '/login';
      }
    } catch (error) {
      console.error("Erreur chargement produits", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        reference: product.reference,
        quantity: product.quantity,
        min_quantity: product.min_quantity,
        unit_price: product.unit_price,
        category: product.category,
        location: product.location,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        reference: "",
        quantity: 0,
        min_quantity: 10,
        unit_price: 0,
        category: "",
        location: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.reference) {
      alert("Nom et référence sont obligatoires");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const url = editingProduct 
        ? `http://localhost:8000/api/products/${editingProduct.id}/`
        : 'http://localhost:8000/api/products/';
      
      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await loadProducts(token!);
        closeModal();
      } else {
        const error = await response.json();
        alert(error.reference?.[0] || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur sauvegarde produit", error);
      alert("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://localhost:8000/api/products/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        await loadProducts(token!);
      }
    } catch (error) {
      console.error("Erreur suppression produit", error);
      alert("Erreur lors de la suppression");
    }
  };

  const canModify = user?.role === "admin" || user?.role === "employee";

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
        <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-[#87CEEB] rounded-full blur-[140px] opacity-4" style={{animation: 'pulse 12s cubic-bezier(0.4, 0, 0.6, 1) infinite'}}></div>
        <div className="absolute bottom-20 left-20 w-[600px] h-[600px] bg-[#00BFFF] rounded-full blur-[160px] opacity-3" style={{animation: 'pulse 14s cubic-bezier(0.4, 0, 0.6, 1) infinite', animationDelay: '2s'}}></div>
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
                  Gestion des Produits
                </h1>
                <p className="text-xs text-[#87CEEB]">Catalogue complet</p>
              </div>
            </div>
            {canModify && (
              <button
                onClick={() => openModal()}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#87CEEB] text-[#0d2838] rounded-xl font-bold hover:shadow-[0_0_12px_rgba(135,206,235,0.4)] active:scale-95 transition-all shadow-[0_0_6px_rgba(135,206,235,0.25)]"
              >
                <PlusCircle className="w-5 h-5" />
                Nouveau produit
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 overflow-y-auto">
        {/* Filters */}
        <div className="bg-black/50 backdrop-blur-xl rounded-2xl shadow-2xl p-5 border border-[#87CEEB]/40 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-[#87CEEB]" />
            <h3 className="text-lg font-bold text-white">Filtres</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#87CEEB]" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, référence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black/40 border border-[#87CEEB]/30 rounded-xl text-white placeholder:text-[#87CEEB]/50 focus:border-[#87CEEB] focus:outline-none transition"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-[#87CEEB]/30 rounded-xl text-white focus:border-[#87CEEB] focus:outline-none transition"
              >
                <option value="" className="bg-[#0d2838]">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#0d2838]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-black/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#87CEEB]/40 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/70 border-b border-[#87CEEB]/40">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#87CEEB] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Produit
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#87CEEB] uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />
                      Référence
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-[#87CEEB] uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-[#87CEEB] uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-[#87CEEB] uppercase tracking-wider">
                    <div className="flex items-center justify-end gap-2">
                      <DollarSign className="w-4 h-4" />
                      Prix Unit.
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-[#87CEEB] uppercase tracking-wider">
                    Valeur Totale
                  </th>
                  {canModify && (
                    <th className="px-6 py-4 text-center text-xs font-bold text-[#87CEEB] uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#87CEEB]/15">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={canModify ? 7 : 6}
                      className="px-6 py-12 text-center"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-[#1e3a5f] flex items-center justify-center">
                          <Package className="w-8 h-8 text-[#87CEEB]" />
                        </div>
                        <p className="text-[#87CEEB] font-bold">Aucun produit trouvé</p>
                        <p className="text-sm text-[#87CEEB]/70">Ajoutez votre premier produit</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-[#1e3a5f]/30 transition"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">
                              {product.name}
                            </span>
                          </div>
                          {product.location && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 text-[#87CEEB]" />
                              <p className="text-sm text-[#87CEEB]/80">{product.location}</p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#87CEEB]">
                        {product.reference}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#1e3a5f]/60 text-[#87CEEB] border border-[#87CEEB]/50">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-bold text-white">
                            {product.quantity}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-white">
                        {Number(product.unit_price).toFixed(2)} DH
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-[#00FF7F]">
                        {Number(product.total_value).toFixed(2)} DH
                      </td>
                      {canModify && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openModal(product)}
                              className="p-2 text-[#87CEEB] hover:text-white hover:bg-[#1e3a5f] rounded-lg transition"
                              title="Modifier"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            {user?.role === "admin" && (
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="p-2 text-white hover:bg-red-500/30 rounded-lg transition"
                                title="Supprimer"
                              >
                                <Trash className="w-5 h-5" />
                              </button>
                            )}
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
        <div className="bg-black/50 backdrop-blur-xl rounded-2xl shadow-2xl p-5 border border-[#87CEEB]/40">
          <div className="flex items-center justify-between text-sm">
            <p className="text-[#87CEEB]">
              Affichage de <span className="font-bold text-white">{filteredProducts.length}</span> sur <span className="font-bold text-white">{products.length}</span> produits
            </p>
            <p className="text-[#87CEEB]">
              Valeur totale:{" "}
              <span className="font-bold text-[#00FF7F]">
                {filteredProducts
                  .reduce((sum, p) => sum + Number(p.total_value || 0), 0)
                  .toLocaleString('fr-FR', {maximumFractionDigits: 2})}{" "}
                DH
              </span>
            </p>
          </div>
        </div>
      </main>

      {/* Modal Add/Edit Product */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#0d2838] to-[#1a3d5f] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#87CEEB]/40">
            <div className="sticky top-0 bg-gradient-to-r from-[#0d2838] to-[#1a3d5f] border-b border-[#87CEEB]/20 px-6 py-5 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white drop-shadow-[0_2px_6px_rgba(135,206,235,0.25)]">
                {editingProduct ? "Modifier le produit" : "Nouveau produit"}
              </h3>
              <button
                onClick={closeModal}
                className="text-[#87CEEB] hover:text-white transition p-1 hover:bg-[#1e3a5f] rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nom */}
                <div>
                  <label className="block text-sm font-semibold text-[#87CEEB] mb-2">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black/40 border border-[#87CEEB]/30 rounded-xl text-white placeholder:text-[#87CEEB]/50 focus:border-[#87CEEB] focus:outline-none transition"
                    placeholder="Nom du produit"
                  />
                </div>

                {/* Référence */}
                <div>
                  <label className="block text-sm font-semibold text-[#87CEEB] mb-2">
                    Référence *
                  </label>
                  <input
                    type="text"
                    value={formData.reference}
                    onChange={(e) =>
                      setFormData({ ...formData, reference: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black/40 border border-[#87CEEB]/30 rounded-xl text-white placeholder:text-[#87CEEB]/50 focus:border-[#87CEEB] focus:outline-none transition"
                    placeholder="REF-001"
                  />
                </div>

                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-semibold text-[#87CEEB] mb-2">
                    Catégorie
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black/40 border border-[#87CEEB]/30 rounded-xl text-white placeholder:text-[#87CEEB]/50 focus:border-[#87CEEB] focus:outline-none transition"
                    list="categories"
                    placeholder="Ex: Électronique"
                  />
                  <datalist id="categories">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                {/* Emplacement */}
                <div>
                  <label className="block text-sm font-semibold text-[#87CEEB] mb-2">
                    Emplacement
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-4 py-3 bg-black/40 border border-[#87CEEB]/30 rounded-xl text-white placeholder:text-[#87CEEB]/50 focus:border-[#87CEEB] focus:outline-none transition"
                    placeholder="Ex: Entrepôt A - Rayon 3"
                  />
                </div>

                {/* Quantité */}
                <div>
                  <label className="block text-sm font-semibold text-[#87CEEB] mb-2">
                    Quantité
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
                    min="0"
                  />
                </div>

                {/* Prix unitaire */}
                <div>
                  <label className="block text-sm font-semibold text-[#87CEEB] mb-2">
                    Prix unitaire (DH)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unit_price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-3 bg-black/40 border border-[#87CEEB]/30 rounded-xl text-white focus:border-[#87CEEB] focus:outline-none transition"
                    min="0"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-[#87CEEB] mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Description
                  </div>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 bg-black/40 border border-[#87CEEB]/30 rounded-xl text-white placeholder:text-[#87CEEB]/50 focus:border-[#87CEEB] focus:outline-none transition resize-none"
                  placeholder="Description détaillée du produit..."
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-[#87CEEB] hover:shadow-[0_0_12px_rgba(135,206,235,0.4)] text-[#0d2838] py-3 rounded-xl transition font-bold shadow-[0_0_6px_rgba(135,206,235,0.25)]"
                >
                  {editingProduct ? "Modifier" : "Ajouter"}
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