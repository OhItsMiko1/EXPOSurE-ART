import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/local-auth";
import { uploadArtworkFormSchema, UploadArtworkFormValues, Category } from "@/lib/types";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Upload, ImagePlus } from "lucide-react";

export default function UploadArtwork() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Redirect if not logged in or not an artist
  if (!user) {
    navigate("/login");
    return null;
  }
  
  if (!user.isArtist) {
    navigate("/");
    return null;
  }
  
  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });
  
  const form = useForm<UploadArtworkFormValues>({
    resolver: zodResolver(uploadArtworkFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: undefined,
      artistId: user.id,
      categoryId: undefined,
      medium: "",
      dimensions: "",
      forSale: true,
      isOriginal: true,
      limitedEdition: false,
      editionCount: undefined,
      image: undefined,
    },
  });
  
  // Watch form values for conditional rendering
  const limitedEdition = form.watch("limitedEdition");
  
  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", e.target.files);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Upload artwork mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: UploadArtworkFormValues) => {
      const formData = new FormData();
      
      // Append all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === "image") {
          // Append the file
          if (data.image && data.image[0]) {
            formData.append("image", data.image[0]);
          }
        } else if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      
      const response = await fetch("/api/artworks", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to upload artwork");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Artwork Uploaded",
        description: "Your artwork has been successfully uploaded.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/artworks'] });
      
      // Navigate to the artwork page
      navigate(`/artwork/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload artwork",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: UploadArtworkFormValues) => {
    uploadMutation.mutate(values);
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Upload Artwork</h1>
        <p className="text-gray-600">Share your artwork with the ArtistSpace community</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column - Artwork info */}
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artwork Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Give your artwork a name" 
                        disabled={uploadMutation.isPending}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your artwork, its inspiration, techniques, etc."
                        className="min-h-32"
                        disabled={uploadMutation.isPending}
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (USD)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00" 
                          disabled={uploadMutation.isPending}
                          {...field}
                          onChange={e => {
                            const value = e.target.value === "" ? undefined : parseFloat(e.target.value);
                            field.onChange(value);
                          }}
                          value={field.value === undefined ? "" : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString() || ""}
                        disabled={uploadMutation.isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map(category => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="medium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medium</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Oil, Acrylic, Digital"
                          disabled={uploadMutation.isPending}
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dimensions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dimensions</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 24in x 36in"
                          disabled={uploadMutation.isPending}
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="forSale"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                          disabled={uploadMutation.isPending}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Available for Sale</FormLabel>
                        <FormDescription>
                          Check this box if you want to sell this artwork
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="isOriginal"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                          disabled={uploadMutation.isPending}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Original Artwork</FormLabel>
                        <FormDescription>
                          Check this box if this is an original piece
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="limitedEdition"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                          disabled={uploadMutation.isPending}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Limited Edition</FormLabel>
                        <FormDescription>
                          Check this box if this is a limited edition print
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                {limitedEdition && (
                  <FormField
                    control={form.control}
                    name="editionCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Editions</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="e.g., 50" 
                            disabled={uploadMutation.isPending}
                            {...field}
                            onChange={e => {
                              const value = e.target.value === "" ? undefined : parseInt(e.target.value);
                              field.onChange(value);
                            }}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the total number of prints in this limited edition
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>
            
            {/* Right column - Image upload and preview */}
            <div>
              <FormField
                control={form.control}
                name="image"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Artwork Image</FormLabel>
                    <FormControl>
                      <Card className="border-dashed border-2 hover:border-primary transition-colors">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center">
                            {imagePreview ? (
                              <div className="mb-4">
                                <img 
                                  src={imagePreview} 
                                  alt="Artwork preview" 
                                  className="max-h-80 object-contain"
                                />
                              </div>
                            ) : (
                              <div className="mb-4 p-8 text-center">
                                <ImagePlus className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                                <p className="text-gray-500">Upload an image of your artwork</p>
                                <p className="text-sm text-gray-400 mt-1">JPG, PNG, or WebP up to 5MB</p>
                              </div>
                            )}
                            
                            <Input
                              id="artwork-image"
                              type="file"
                              accept="image/*"
                              disabled={uploadMutation.isPending}
                              onChange={handleImageChange}
                              className="hidden"
                              {...fieldProps}
                            />
                            <Button 
                              type="button" 
                              variant={imagePreview ? "outline" : "default"}
                              onClick={() => document.getElementById("artwork-image")?.click()}
                              className="mt-2"
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              {imagePreview ? "Change Image" : "Upload Image"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="border-t pt-6">
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={uploadMutation.isPending || !imagePreview}
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload Artwork"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
