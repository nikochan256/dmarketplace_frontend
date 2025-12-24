"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ShoppingCart,
  Check,
  Package,
  Truck,
  ShieldCheck,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Product() {
    const router = useRouter();
  const params = useParams();

  const paramsArray = Array.isArray(params.productId)
    ? params.productId
    : [params.productId];
  const storeId = params.store_id;
  const productId = params.productId;

  const [product, setProduct] = useState(null);
  const [storeInfo, setStoreInfo] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [btcRate, setBtcRate] = useState(null);
  const [btcLoading, setBtcLoading] = useState(true);

  // Fetch BTC price from API
  const fetchBtcRate = async () => {
    try {
      setBtcLoading(true);
      console.log("💰 Fetching BTC exchange rate...");

      const response = await fetch(
        "https://api.coinbase.com/v2/exchange-rates?currency=BTC"
      );
      const data = await response.json();

      if (data && data.data && data.data.rates && data.data.rates.EUR) {
        const btcToEur = parseFloat(data.data.rates.EUR);
        const eurToBtc = 1 / btcToEur;
        setBtcRate(eurToBtc);
        console.log("✅ BTC Rate fetched:", eurToBtc, "BTC per EUR");
      } else {
        throw new Error("Invalid BTC rate response");
      }
    } catch (error) {
      console.error("❌ Error fetching BTC rate:", error);
      // Fallback rate
      setBtcRate(0.000011);
    } finally {
      setBtcLoading(false);
    }
  };

  // Convert EUR to BTC
  const convertToBtc = (eurAmount) => {
    if (!btcRate || btcLoading) return "...";
    const btcAmount = eurAmount * btcRate;
    return btcAmount.toFixed(8);
  };

  // Format BTC with symbol
  const formatBtc = (eurAmount) => {
    return `₿${convertToBtc(eurAmount)}`;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://dmarketplacebackend.vercel.app/merchant/single-product/${storeId}/${productId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }

        const result = await response.json();
        setProduct(result.data);
        setStoreInfo(result.store);

        if (result.data.sync_variants && result.data.sync_variants.length > 0) {
          const firstVariant = result.data.sync_variants[0];
          setSelectedVariant(firstVariant);
          setSelectedColor(firstVariant.color);
          setSelectedSize(firstVariant.size);
          const previewImage = firstVariant.files.find(
            (f) => f.type === "preview"
          );
          setSelectedImage(
            previewImage?.preview_url || result.data.sync_product.thumbnail_url
          );
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (storeId && productId) {
      fetchProduct();
    }

    scrollTo(0, 0);
  }, [storeId, productId]);

  useEffect(() => {
    fetchBtcRate();

    // Refresh BTC rate every 60 seconds
    const interval = setInterval(() => {
      fetchBtcRate();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    setSelectedColor(variant.color);
    setSelectedSize(variant.size);
    const previewImage = variant.files.find((f) => f.type === "preview");
    setSelectedImage(
      previewImage?.preview_url || product.sync_product.thumbnail_url
    );
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    const variant = product.sync_variants.find(
      (v) => v.color === color && v.size === selectedSize
    );
    if (variant) {
      setSelectedVariant(variant);
      const previewImage = variant.files.find((f) => f.type === "preview");
      setSelectedImage(
        previewImage?.preview_url || product.sync_product.thumbnail_url
      );
    }
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    const variant = product.sync_variants.find(
      (v) => v.color === selectedColor && v.size === size
    );
    if (variant) {
      setSelectedVariant(variant);
      const previewImage = variant.files.find((f) => f.type === "preview");
      setSelectedImage(
        previewImage?.preview_url || product.sync_product.thumbnail_url
      );
    }
  };

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);

      const userId = localStorage.getItem("dmarketplaceUserId");

      if (!userId) {
        alert("Please connect your wallet first");
        setAddingToCart(false);
        return;
      }

      if (!selectedVariant) {
        alert("Please select a variant");
        setAddingToCart(false);
        return;
      }

      const productImg =
        selectedVariant.files.find((f) => f.type === "preview")?.preview_url ||
        product.sync_product.thumbnail_url;

      const productName = product.sync_product.name;
      const productPrice = selectedVariant.retail_price;

      const response = await fetch(
        `https://dmarketplacebackend.vercel.app/merchant/add-printfull-product-to-cart/${storeId}/${productId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
            variant_id: selectedVariant.id,
            quantity: 1,
            productImg: productImg,
            productName: productName,
            productPrice: productPrice,
          }),
        }
      );

      console.log(response);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to add to cart");
      }

      const result = await response.json();
      console.log("Added to cart:", result);

      setShowCartPopup(true);
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert(err.message || "Failed to add product to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  const uniqueColors = [...new Set(product?.sync_variants.map((v) => v.color))];
  const uniqueSizes = [...new Set(product?.sync_variants.map((v) => v.size))];

  if (loading) {
    return (
      <div className="mx-6">
        <div className="max-w-7xl mx-auto min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
            <div className="text-slate-500">Loading product...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-6">
        <div className="max-w-7xl mx-auto min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-lg font-medium mb-2">Error</div>
            <div className="text-slate-600">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-6">
        <div className="max-w-7xl mx-auto min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="text-slate-500 text-lg">Product not found</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* BTC Rate Display */}
      {btcLoading ? (
        <div className="fixed top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md border border-slate-200 flex items-center gap-2 z-50">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
          <span className="text-sm text-slate-600">Loading BTC rate...</span>
        </div>
      ) : (
        <div className="fixed top-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md border border-slate-200 z-50">
          <span className="text-sm text-slate-600">1 EUR = </span>
          <span className="text-sm font-bold text-orange-600">
            ₿{btcRate?.toFixed(8)}
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Breadcrumbs */}
        <div className="text-sm text-slate-600 mb-8 flex items-center gap-2">
          <span className="hover:text-slate-900 cursor-pointer">Home</span>
          <span>/</span>
          <span className="hover:text-slate-900 cursor-pointer">
            {storeInfo?.shopName}
          </span>
          <span>/</span>
          <span className="text-slate-900 font-medium">
            {product.sync_product.name}
          </span>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
              <Image
                src={selectedImage || product.sync_product.thumbnail_url}
                alt={product.sync_product.name}
                fill
                className="object-contain p-8"
              />
            </div>

            <div className="grid grid-cols-4 gap-3">
              {selectedVariant?.files
                .filter((f) => f.visible || f.type === "preview")
                .map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(file.preview_url)}
                    className={`relative aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all hover:border-slate-400 ${
                      selectedImage === file.preview_url
                        ? "border-slate-900 ring-2 ring-slate-300"
                        : "border-slate-200"
                    }`}
                  >
                    <Image
                      src={file.preview_url}
                      alt={`Preview ${idx + 1}`}
                      fill
                      className="object-contain p-2"
                    />
                  </button>
                ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-sm">
              <Image
                src={`https://dmarketplacebackend.vercel.app/${storeInfo?.logoImg.replace(
                  /\\/g,
                  "/"
                )}`}
                alt={storeInfo?.shopName}
                width={20}
                height={20}
                className="rounded-full"
              />
              <span className="text-slate-700">{storeInfo?.shopName}</span>
            </div>

            <h1 className="text-4xl font-bold text-slate-900">
              {product.sync_product.name}
            </h1>

            {/* Price in BTC */}
            {selectedVariant && (
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-orange-600">
                    {formatBtc(selectedVariant.retail_price)}
                  </span>
                </div>
                <div className="text-sm text-slate-500">
                  (€{selectedVariant.retail_price} EUR)
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {selectedVariant?.synced && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  <Check className="w-4 h-4" />
                  In Stock
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {product.sync_product.variants} Variants Available
              </span>
            </div>

            {selectedVariant && (
              <div className="bg-slate-50 rounded-xl p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Product Name:</span>
                  <span className="text-slate-900 font-medium">
                    {selectedVariant.product.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">SKU:</span>
                  <span className="text-slate-900 font-mono text-xs">
                    {selectedVariant.sku}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Status:</span>
                  <span className="text-slate-900 capitalize">
                    {selectedVariant.availability_status}
                  </span>
                </div>
              </div>
            )}

            {uniqueColors.length > 1 && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-900">
                  Color:{" "}
                  <span className="text-slate-600 font-normal">
                    {selectedColor}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {uniqueColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(color)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedColor === color
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {uniqueSizes.length > 1 && (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-900">
                  Size:{" "}
                  <span className="text-slate-600 font-normal">
                    {selectedSize}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {uniqueSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeChange(size)}
                      className={`px-4 py-2 rounded-lg border-2 text-sm font-medium ${
                        selectedSize === size
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart Button with Loading */}
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-semibold text-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingToCart ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Adding to Cart...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </>
              )}
            </button>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full">
                  <Truck className="w-6 h-6 text-slate-700" />
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Fast Shipping
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full">
                  <ShieldCheck className="w-6 h-6 text-slate-700" />
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Secure Payment
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full">
                  <Package className="w-6 h-6 text-slate-700" />
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Quality Guaranteed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* All Variants Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Available Variants
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.sync_variants.slice(0, 4).map((variant) => (
              <div
                key={variant.id}
                onClick={() => handleVariantChange(variant)}
                className={`cursor-pointer rounded-xl border-2 p-5 transition-all hover:shadow-md ${
                  selectedVariant?.id === variant.id
                    ? "border-slate-900 bg-slate-50"
                    : "border-slate-200 bg-white hover:border-slate-400"
                }`}
              >
                <div className="relative aspect-square bg-slate-50 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={
                      variant.files.find((f) => f.type === "preview")
                        ?.preview_url || variant.product.image
                    }
                    alt={variant.name}
                    fill
                    className="object-contain p-4"
                  />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 text-sm">
                  {variant.name}
                </h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-orange-600">
                    {formatBtc(variant.retail_price)}
                  </span>
                  {variant.synced && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      <Check className="w-3 h-3" />
                      Available
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mb-3">
                  (€{variant.retail_price})
                </div>
                <div className="space-y-1 text-xs text-slate-600">
                  <p>
                    Color:{" "}
                    <span className="font-medium text-slate-900">
                      {variant.color}
                    </span>
                  </p>
                  <p>
                    Size:{" "}
                    <span className="font-medium text-slate-900">
                      {variant.size}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Popup Modal */}
      {showCartPopup && selectedVariant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowCartPopup(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 text-center mb-6">
              Added to Cart!
            </h3>

            <div className="flex gap-4 mb-6">
              <div className="relative w-24 h-24 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={
                    selectedVariant.files.find((f) => f.type === "preview")
                      ?.preview_url || selectedVariant.product.image
                  }
                  alt={selectedVariant.name}
                  fill
                  className="object-contain p-2"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900 mb-2">
                  {selectedVariant.name}
                </h4>
                <div className="space-y-1 text-sm text-slate-600">
                  <p>
                    Color:{" "}
                    <span className="font-medium text-slate-900">
                      {selectedVariant.color}
                    </span>
                  </p>
                  <p>
                    Size:{" "}
                    <span className="font-medium text-slate-900">
                      {selectedVariant.size}
                    </span>
                  </p>
                  <p className="text-lg font-bold text-orange-600 mt-2">
                    {formatBtc(selectedVariant.retail_price)}
                  </p>
                  <p className="text-xs text-slate-500">
                    (€{selectedVariant.retail_price})
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCartPopup(false)}
                className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => router.push("/cart")}
                className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
              >
                View Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
