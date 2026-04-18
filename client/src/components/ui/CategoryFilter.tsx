import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Category } from "@/lib/types";

interface CategoryFilterProps {
  title: string;
  onCategoryChange: (categoryId: number | null) => void;
  selectedCategoryId: number | null;
}

export default function CategoryFilter({ 
  title, 
  onCategoryChange, 
  selectedCategoryId 
}: CategoryFilterProps) {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    }
  });
  
  return (
    <section className="bg-white pt-8 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 font-poppins">{title}</h2>
          <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
            <Button
              variant={selectedCategoryId === null ? "default" : "outline"}
              className={`text-sm rounded-full ${selectedCategoryId === null ? 'bg-primary' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              onClick={() => onCategoryChange(null)}
            >
              All
            </Button>
            
            {isLoading ? (
              // Loading skeletons
              Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full" />
              ))
            ) : (
              categories?.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategoryId === category.id ? "default" : "outline"}
                  className={`text-sm rounded-full ${selectedCategoryId === category.id ? 'bg-primary' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  onClick={() => onCategoryChange(category.id)}
                >
                  {category.name}
                </Button>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
