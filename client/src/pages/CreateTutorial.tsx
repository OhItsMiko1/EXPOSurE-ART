import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/local-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createTutorialFormSchema, CreateTutorialFormValues, Category } from "@/lib/types";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, BookOpen, Image, Plus, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function CreateTutorial() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("basic");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories for the dropdown
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Form
  const form = useForm<CreateTutorialFormValues>({
    resolver: zodResolver(createTutorialFormSchema),
    defaultValues: {
      title: "",
      description: "",
      content: "",
      categoryId: undefined,
      difficulty: "beginner",
      durationMinutes: undefined,
      published: false,
      publishDate: undefined,
      authorId: user?.id
    },
  });

  // Tutorial submission mutation
  const submitTutorialMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("POST", "/api/tutorials", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tutorials'] });
      toast({
        title: "Tutorial created",
        description: "Your tutorial has been created successfully.",
      });
      navigate("/tutorials");
    },
    onError: (error) => {
      console.error("Error creating tutorial:", error);
      toast({
        title: "Failed to create tutorial",
        description: "There was a problem creating your tutorial. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: CreateTutorialFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a tutorial.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      
      // Add all text fields
      formData.append("title", values.title);
      formData.append("description", values.description || "");
      formData.append("content", values.content || "");
      formData.append("authorId", user.id.toString());
      
      if (values.categoryId) {
        formData.append("categoryId", values.categoryId.toString());
      }
      
      if (values.difficulty) {
        formData.append("difficulty", values.difficulty);
      }
      
      if (values.durationMinutes) {
        formData.append("durationMinutes", values.durationMinutes.toString());
      }
      
      formData.append("published", values.published ? "true" : "false");
      
      // Add image if selected
      if (values.image && values.image.length > 0) {
        formData.append("image", values.image[0]);
      }
      
      await submitTutorialMutation.mutateAsync(formData);
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", e.target.files as any);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  // Redirect if user is not an artist
  if (!user || !user.isArtist) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Restricted</AlertTitle>
          <AlertDescription>
            Only verified artists can create tutorials. Please contact support if you believe this is an error.
          </AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/tutorials">Go Back to Tutorials</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Tutorial</h1>
          <p className="text-gray-600 mt-2">
            Share your knowledge and techniques with the community
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6 mb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Mastering Watercolor Techniques" {...field} />
                          </FormControl>
                          <FormDescription>
                            A clear, descriptive title for your tutorial
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            defaultValue={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The art category this tutorial belongs to
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Difficulty Level</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value ?? undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select difficulty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                              <SelectItem value="expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The skill level required for this tutorial
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="durationMinutes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Duration (minutes)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g. 30"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>
                            Estimated time to complete this tutorial
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what artists will learn from this tutorial..."
                            className="min-h-32"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          A detailed description of what the tutorial covers
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Cover Image</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                {...fieldProps}
                              />
                            </div>
                            {imagePreview && (
                              <div className="w-24 h-24 rounded-md overflow-hidden border border-gray-200">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          An image to represent your tutorial (recommended size: 1200 x 630 pixels)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="published"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Publish Immediately</FormLabel>
                          <FormDescription>
                            If selected, your tutorial will be published immediately. Otherwise, it will be saved as a draft.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="mr-2"
                      onClick={() => navigate("/tutorials")}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setActiveTab("content")}
                    >
                      Next: Add Content
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="content" className="space-y-6">
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tutorial Content *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Write your tutorial content here. Use Markdown for formatting if you like."
                            className="min-h-[350px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          The main content of your tutorial. You can add steps later.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                    <h3 className="text-amber-800 font-medium flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      Note about Tutorial Steps
                    </h3>
                    <p className="text-amber-700 mt-1">
                      After creating your tutorial, you'll be able to add detailed step-by-step instructions.
                      Each step can include images, videos, and text instructions.
                    </p>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveTab("basic")}
                    >
                      Back to Basic Info
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setActiveTab("preview")}
                    >
                      Preview Tutorial
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="preview" className="space-y-6">
                  {/* Preview of the tutorial */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2">
                          {form.watch("title") || "Untitled Tutorial"}
                        </h2>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {form.watch("difficulty") && (
                            <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                              {form.watch("difficulty")}
                            </div>
                          )}
                          {form.watch("durationMinutes") && (
                            <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {form.watch("durationMinutes")} minutes
                            </div>
                          )}
                          {form.watch("categoryId") && (
                            <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              {categories.find(c => c.id === form.watch("categoryId"))?.name || "Category"}
                            </div>
                          )}
                        </div>
                        
                        <div className="mb-6">
                          {imagePreview ? (
                            <img 
                              src={imagePreview} 
                              alt="Tutorial cover"
                              className="w-full h-60 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-60 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                              <Image className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="prose max-w-none mb-6">
                          <h3 className="text-xl font-semibold mb-2">Description</h3>
                          <p>{form.watch("description") || "No description provided."}</p>
                        </div>
                        
                        <div className="prose max-w-none">
                          <h3 className="text-xl font-semibold mb-2">Content</h3>
                          <div>
                            {form.watch("content") ? (
                              <div className="whitespace-pre-wrap">
                                {form.watch("content")}
                              </div>
                            ) : (
                              <p className="text-gray-500 italic">No content provided.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setActiveTab("content")}
                    >
                      Back to Content
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating..." : "Create Tutorial"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}