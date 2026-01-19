import React, { useState, useEffect } from 'react';
import { Coffee, Plus, Trash2, Edit2, X, Search, ShoppingCart, DollarSign } from 'lucide-react';

// Mock Backend API (In-Memory Storage)
class CafeAPI {
  constructor() {
    this.menu = [
      { 
        id: 1, 
        name: 'Espresso', 
        category: 'Coffee',
        price: 25000,
        stock: 50,
        description: 'Kopi espresso murni dengan rasa yang kuat'
      },
      { 
        id: 2, 
        name: 'Cappuccino', 
        category: 'Coffee',
        price: 35000,
        stock: 45,
        description: 'Espresso dengan susu panas dan foam'
      },
      { 
        id: 3, 
        name: 'Croissant', 
        category: 'Pastry',
        price: 20000,
        stock: 30,
        description: 'Pastry mentega berlapis renyah'
      },
      { 
        id: 4, 
        name: 'Matcha Latte', 
        category: 'Non-Coffee',
        price: 40000,
        stock: 35,
        description: 'Teh hijau Jepang dengan susu'
      }
    ];
    this.nextId = 5;
  }

  // GET all menu items
  async getAllMenu() {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.menu]), 300);
    });
  }

  // GET menu item by ID
  async getMenuById(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const item = this.menu.find(m => m.id === id);
        if (item) resolve({ ...item });
        else reject({ error: 'Menu item not found' });
      }, 300);
    });
  }

  // POST create new menu item
  async createMenu(menuData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newItem = {
          id: this.nextId++,
          ...menuData,
          price: parseInt(menuData.price),
          stock: parseInt(menuData.stock)
        };
        this.menu.push(newItem);
        resolve({ ...newItem });
      }, 300);
    });
  }

  // PUT update menu item
  async updateMenu(id, menuData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.menu.findIndex(m => m.id === id);
        if (index !== -1) {
          this.menu[index] = { 
            ...this.menu[index], 
            ...menuData,
            price: parseInt(menuData.price),
            stock: parseInt(menuData.stock)
          };
          resolve({ ...this.menu[index] });
        } else {
          reject({ error: 'Menu item not found' });
        }
      }, 300);
    });
  }

  // DELETE menu item
  async deleteMenu(id) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.menu.findIndex(m => m.id === id);
        if (index !== -1) {
          this.menu.splice(index, 1);
          resolve({ message: 'Menu item deleted successfully' });
        } else {
          reject({ error: 'Menu item not found' });
        }
      }, 300);
    });
  }

  // PATCH update stock
  async updateStock(id, quantity) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = this.menu.findIndex(m => m.id === id);
        if (index !== -1) {
          this.menu[index].stock += quantity;
          resolve({ ...this.menu[index] });
        } else {
          reject({ error: 'Menu item not found' });
        }
      }, 300);
    });
  }
}

// Initialize API
const api = new CafeAPI();

export default function CafeManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    category: 'Coffee', 
    price: '', 
    stock: '', 
    description: '' 
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const categories = ['All', 'Coffee', 'Non-Coffee', 'Pastry', 'Snack'];

  // Fetch menu on mount
  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const data = await api.getAllMenu();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.price || !formData.stock) return;

    setLoading(true);
    try {
      if (editingId) {
        await api.updateMenu(editingId, formData);
        setEditingId(null);
      } else {
        await api.createMenu(formData);
      }
      setFormData({ name: '', category: 'Coffee', price: '', stock: '', description: '' });
      await fetchMenu();
    } catch (error) {
      console.error('Error saving menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await api.deleteMenu(id);
      await fetchMenu();
    } catch (error) {
      console.error('Error deleting menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({ 
      name: item.name, 
      category: item.category, 
      price: item.price.toString(), 
      stock: item.stock.toString(), 
      description: item.description 
    });
    setEditingId(item.id);
  };

  const handleCancelEdit = () => {
    setFormData({ name: '', category: 'Coffee', price: '', stock: '', description: '' });
    setEditingId(null);
  };

  const filteredMenu = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const totalValue = menuItems.reduce((sum, item) => sum + (item.price * item.stock), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-2">
            <Coffee className="text-orange-600" size={48} />
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Cafe Management</h1>
              <p className="text-gray-600">Sistem Manajemen Menu & Inventory</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8 mt-6">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Coffee size={20} />
                <span className="text-sm font-medium">Total Menu</span>
              </div>
              <p className="text-3xl font-bold">{menuItems.length}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingCart size={20} />
                <span className="text-sm font-medium">Total Stock</span>
              </div>
              <p className="text-3xl font-bold">{menuItems.reduce((sum, item) => sum + item.stock, 0)}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign size={20} />
                <span className="text-sm font-medium">Nilai Inventory</span>
              </div>
              <p className="text-2xl font-bold">{formatPrice(totalValue)}</p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-gray-50 p-6 rounded-xl mb-8 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {editingId ? 'Edit Menu' : 'Tambah Menu Baru'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nama menu..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              >
                <option value="Coffee">Coffee</option>
                <option value="Non-Coffee">Non-Coffee</option>
                <option value="Pastry">Pastry</option>
                <option value="Snack">Snack</option>
              </select>
              <input
                type="number"
                placeholder="Harga (Rp)..."
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
              <input
                type="number"
                placeholder="Stok..."
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
              <textarea
                placeholder="Deskripsi..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="col-span-2 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                rows="2"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
              >
                {editingId ? <Edit2 size={20} /> : <Plus size={20} />}
                {editingId ? 'Update Menu' : 'Tambah Menu'}
              </button>
              {editingId && (
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  <X size={20} />
                  Batal
                </button>
              )}
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Cari menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Menu List */}
          {loading && menuItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : filteredMenu.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchTerm || filterCategory !== 'All' ? 'Tidak ada menu yang cocok dengan filter' : 'Belum ada menu. Tambahkan menu pertama!'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMenu.map((item) => (
                <div
                  key={item.id}
                  className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl text-gray-800">{item.name}</h3>
                      <span className="inline-block mt-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-2xl font-bold text-orange-600">{formatPrice(item.price)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Stok</p>
                      <p className={`text-lg font-semibold ${item.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                        {item.stock} pcs
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}