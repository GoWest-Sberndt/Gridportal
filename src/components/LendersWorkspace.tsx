import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Phone,
  Mail,
  Globe,
  MapPin,
  ChevronDown,
  ChevronUp,
  Grid3X3,
  List,
  X,
  ExternalLink,
  Building2,
} from "lucide-react";
import { supabaseHelpers } from "@/lib/supabase";
import type { Tables } from "@/types/supabase";

// Define the lending products mapping
const LENDING_PRODUCTS = [
  { key: "has_conventional", label: "Conventional" },
  { key: "has_fha", label: "FHA" },
  { key: "has_va", label: "VA" },
  { key: "has_usda", label: "USDA" },
  { key: "has_jumbo", label: "Jumbo" },
  { key: "has_heloc", label: "HELOC" },
  { key: "has_dpa", label: "DPA" },
  { key: "has_bank_statement", label: "Bank Statement" },
  { key: "has_dscr", label: "DSCR" },
] as const;

export default function LendersWorkspace() {
  console.log("🏦 LendersWorkspace: Component rendering");

  const [lenders, setLenders] = useState<Tables<"lenders">[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedLendingProducts, setSelectedLendingProducts] = useState<
    string[]
  >([]);
  const [selectedLender, setSelectedLender] =
    useState<Tables<"lenders"> | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  useEffect(() => {
    console.log("🏦 LendersWorkspace: Component mounted, starting useEffect");

    const loadLenders = async () => {
      try {
        setLoading(true);
        console.log("🏦 LendersWorkspace: Starting to load lenders...");
        const lendersData = await supabaseHelpers.getLenders();
        console.log(
          "🏦 LendersWorkspace: Raw lenders data loaded:",
          lendersData,
        );
        console.log(
          "🏦 LendersWorkspace: Number of lenders:",
          lendersData?.length || 0,
        );

        if (lendersData && lendersData.length > 0) {
          // Log first lender's lending products for debugging
          const firstLender = lendersData[0];
          console.log("🏦 LendersWorkspace: First lender data:", firstLender);
          console.log("🏦 LendersWorkspace: First lender lending products:", {
            company_name: firstLender.company_name,
            has_conventional: firstLender.has_conventional,
            has_fha: firstLender.has_fha,
            has_va: firstLender.has_va,
            has_usda: firstLender.has_usda,
            has_jumbo: firstLender.has_jumbo,
            has_heloc: firstLender.has_heloc,
            has_dpa: firstLender.has_dpa,
            has_bank_statement: firstLender.has_bank_statement,
            has_dscr: firstLender.has_dscr,
          });

          // Test the getLenderProducts function immediately
          console.log(
            "🏦 LendersWorkspace: Testing getLenderProducts function:",
          );
          const testProducts = getLenderProducts(firstLender);
          console.log(
            "🏦 LendersWorkspace: Test products result:",
            testProducts,
          );
        }

        setLenders(lendersData || []);
        console.log("🏦 LendersWorkspace: Lenders state updated");
      } catch (err) {
        console.error("🏦 LendersWorkspace: Error loading lenders:", err);
        setError("Failed to load lenders");
      } finally {
        setLoading(false);
        console.log("🏦 LendersWorkspace: Loading complete");
      }
    };

    loadLenders();
  }, []);

  // Helper function to get lending products for a lender
  const getLenderProducts = (lender: Tables<"lenders">) => {
    console.log(
      `🏦 LendersWorkspace: Getting products for ${lender.company_name}:`,
    );
    console.log(`🏦 LendersWorkspace: Raw lender data:`, lender);

    const products = LENDING_PRODUCTS.filter((product) => {
      const value = lender[product.key as keyof Tables<"lenders">];
      console.log(
        `🏦 LendersWorkspace:   - ${product.key}: ${value} (${typeof value})`,
      );
      return value === true;
    });

    console.log(
      `🏦 LendersWorkspace: Final products for ${lender.company_name}:`,
      products.map((p) => p.label),
    );
    return products;
  };

  // Filter lenders based on search and selected products
  const filteredLenders = lenders.filter((lender) => {
    // Ensure we have a valid lender object
    if (!lender || !lender.company_name) return false;

    // Search filter - safely handle undefined values
    let matchesSearch = true;
    if (
      searchTerm &&
      typeof searchTerm === "string" &&
      searchTerm.trim() !== ""
    ) {
      const searchLower = searchTerm.toLowerCase();
      const companyName = (lender.company_name || "").toLowerCase();
      const companyDescription = (
        lender.company_description || ""
      ).toLowerCase();
      const aeName = (lender.ae_name || "").toLowerCase();

      matchesSearch =
        companyName.includes(searchLower) ||
        companyDescription.includes(searchLower) ||
        aeName.includes(searchLower);
    }

    // Product filter - if no products selected, show all
    if (selectedLendingProducts.length === 0) {
      return matchesSearch;
    }

    // Check if lender has any of the selected products
    const lenderProducts = getLenderProducts(lender);
    const hasSelectedProduct = selectedLendingProducts.some((selectedProduct) =>
      lenderProducts.some(
        (lenderProduct) => lenderProduct.label === selectedProduct,
      ),
    );

    return matchesSearch && hasSelectedProduct;
  });

  // Debug logging
  console.log("🏦 LendersWorkspace: Current state:", {
    totalLenders: lenders.length,
    filteredLenders: filteredLenders.length,
    selectedFilters: selectedLendingProducts,
    searchTerm: searchTerm,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#032F60] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lenders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50">
      <div className="flex h-full">
        {/* Main Directory Content */}
        <div
          className={`transition-all duration-300 ${selectedLender ? "flex-1" : "w-full"}`}
        >
          <div className="h-full p-6">
            <div className="max-w-none space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Lenders Directory
                  </h1>
                  <p className="text-gray-600">
                    Browse our network of trusted lending partners
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode("card")}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === "card"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-md transition-colors ${
                        viewMode === "list"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search lenders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>
                </div>
              </div>

              {/* Lending Products Filter */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Filter by Lending Products
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {LENDING_PRODUCTS.map((product) => {
                      const isSelected = selectedLendingProducts.includes(
                        product.label,
                      );
                      return (
                        <button
                          key={product.key}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedLendingProducts(
                                selectedLendingProducts.filter(
                                  (p) => p !== product.label,
                                ),
                              );
                            } else {
                              setSelectedLendingProducts([
                                ...selectedLendingProducts,
                                product.label,
                              ]);
                            }
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            isSelected
                              ? "bg-purple-100 text-purple-800 border-2 border-purple-300"
                              : "bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200"
                          }`}
                        >
                          {product.label}
                        </button>
                      );
                    })}
                  </div>
                  {selectedLendingProducts.length > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        Filtering by: {selectedLendingProducts.join(", ")}
                      </span>
                      <button
                        onClick={() => setSelectedLendingProducts([])}
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Lenders Display */}
              {viewMode === "card" ? (
                /* Card View */
                <div
                  className={`grid gap-6 ${selectedLender ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}
                >
                  {filteredLenders.map((lender) => {
                    const lenderProducts = getLenderProducts(lender);

                    return (
                      <Card
                        key={lender.id}
                        className="hover:shadow-lg transition-all duration-200 flex flex-col cursor-pointer transform hover:scale-105"
                        onClick={() => setSelectedLender(lender)}
                      >
                        <CardContent className="p-6 flex flex-col">
                          {/* Logo/Avatar */}
                          <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mx-auto mb-4">
                            {lender.company_logo ? (
                              <img
                                src={lender.company_logo}
                                alt={lender.company_name || "Company logo"}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  const fallback =
                                    target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className="w-full h-full bg-[#032F60] flex items-center justify-center text-white font-bold text-lg"
                              style={{
                                display: lender.company_logo ? "none" : "flex",
                              }}
                            >
                              {lender.company_name &&
                              lender.company_name.length > 0
                                ? lender.company_name.charAt(0)
                                : "?"}
                            </div>
                          </div>

                          {/* Company Name */}
                          <h3 className="font-semibold text-base text-center mb-3 line-clamp-2">
                            {lender.company_name || "Unknown Company"}
                          </h3>

                          {/* Products Count */}
                          {lenderProducts.length > 0 && (
                            <div className="text-center mb-3">
                              <Badge variant="outline" className="text-sm">
                                {lenderProducts.length} products
                              </Badge>
                            </div>
                          )}

                          {/* AE Name */}
                          {lender.ae_name && (
                            <p className="text-sm text-gray-600 text-center mb-3 line-clamp-1">
                              AE: {lender.ae_name}
                            </p>
                          )}

                          {/* View Details Button */}
                          <div className="mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-sm hover:bg-[#032F60] hover:text-white transition-colors"
                            >
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                /* List View */
                <div className="space-y-4">
                  {filteredLenders.map((lender) => {
                    const lenderProducts = getLenderProducts(lender);

                    return (
                      <Card
                        key={lender.id}
                        className="hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
                        onClick={() => setSelectedLender(lender)}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                                {lender.company_logo ? (
                                  <img
                                    src={lender.company_logo}
                                    alt={lender.company_name || "Company logo"}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.style.display = "none";
                                      const fallback =
                                        target.nextElementSibling as HTMLElement;
                                      if (fallback)
                                        fallback.style.display = "flex";
                                    }}
                                  />
                                ) : null}
                                <div
                                  className="w-full h-full bg-[#032F60] flex items-center justify-center text-white font-bold text-sm"
                                  style={{
                                    display: lender.company_logo
                                      ? "none"
                                      : "flex",
                                  }}
                                >
                                  {lender.company_name &&
                                  lender.company_name.length > 0
                                    ? lender.company_name.charAt(0)
                                    : "?"}
                                </div>
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-lg">
                                  {lender.company_name || "Unknown Company"}
                                </CardTitle>
                                <div className="flex items-center space-x-2 mt-1">
                                  {lenderProducts.length > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {lenderProducts.length} products
                                    </Badge>
                                  )}
                                  {lender.ae_name && (
                                    <span className="text-xs text-gray-500">
                                      AE: {lender.ae_name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-[#032F60] hover:text-white transition-colors"
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              )}

              {filteredLenders.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🏦</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No lenders found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "No lenders have been added yet"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lender Details Panel - Integrated as part of the workspace */}
        {selectedLender && (
          <div className="w-96 bg-white border-l border-gray-200 flex-shrink-0">
            <div className="h-full overflow-y-auto">
              {/* Header */}
              <div className="relative bg-gradient-to-br from-[#032F60] to-[#1e40af] p-6 text-white">
                <button
                  onClick={() => setSelectedLender(null)}
                  className="absolute top-4 right-4 p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Lender Logo/Avatar */}
                <div className="flex flex-col items-center text-center mb-4">
                  <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden mb-3">
                    {selectedLender.company_logo ? (
                      <img
                        src={selectedLender.company_logo}
                        alt={selectedLender.company_name || "Company logo"}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const fallback =
                            target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full bg-white bg-opacity-30 flex items-center justify-center text-white font-bold text-2xl"
                      style={{
                        display: selectedLender.company_logo ? "none" : "flex",
                      }}
                    >
                      {selectedLender.company_name &&
                      selectedLender.company_name.length > 0
                        ? selectedLender.company_name.charAt(0)
                        : "?"}
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mb-2">
                    {selectedLender.company_name}
                  </h2>
                  {selectedLender.company_website && (
                    <Button
                      onClick={() =>
                        window.open(selectedLender.company_website, "_blank")
                      }
                      className="bg-white text-[#032F60] hover:bg-gray-100 font-semibold px-6 py-2 rounded-full flex items-center gap-2 transition-all transform hover:scale-105"
                    >
                      <Globe className="w-4 h-4" />
                      Open Portal
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Description */}
                {selectedLender.company_description && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      About
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {selectedLender.company_description}
                    </p>
                  </div>
                )}

                {/* Lending Products */}
                {(() => {
                  const lenderProducts = getLenderProducts(selectedLender);
                  return lenderProducts.length > 0 ? (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Lending Products
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {lenderProducts.map((product) => (
                          <Badge
                            key={product.key}
                            className="bg-purple-100 text-purple-800 border-purple-200 justify-center py-2 text-xs font-medium"
                          >
                            {product.label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Contact Information */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    {selectedLender.company_email && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">
                            Email
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {selectedLender.company_email}
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedLender.company_phone && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Phone className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">
                            Phone
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {selectedLender.company_phone}
                          </div>
                        </div>
                      </div>
                    )}
                    {(selectedLender.company_address ||
                      selectedLender.company_city ||
                      selectedLender.company_state) && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">
                            Address
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {[
                              selectedLender.company_address,
                              selectedLender.company_city,
                              selectedLender.company_state,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                            {selectedLender.company_zip &&
                              ` ${selectedLender.company_zip}`}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Executive */}
                {selectedLender.ae_name && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Account Executive
                    </h3>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                          <AvatarImage src={selectedLender.ae_photo} />
                          <AvatarFallback className="bg-[#032F60] text-white font-semibold">
                            {selectedLender.ae_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            {selectedLender.ae_name}
                          </div>
                          {selectedLender.ae_title && (
                            <div className="text-sm text-gray-600 mb-1">
                              {selectedLender.ae_title}
                            </div>
                          )}
                          <div className="space-y-1">
                            {selectedLender.ae_email && (
                              <div className="text-xs text-gray-500">
                                {selectedLender.ae_email}
                              </div>
                            )}
                            {selectedLender.ae_phone && (
                              <div className="text-xs text-gray-500">
                                {selectedLender.ae_phone}
                                {selectedLender.ae_extension &&
                                  ` ext. ${selectedLender.ae_extension}`}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedLender.notes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <p className="text-sm text-gray-700">
                        {selectedLender.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
