import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Palette, Sparkles } from 'lucide-react';

// Import or define the Category type
interface Category {
  id: number;
  name: string;
  description?: string;
}

// Define form schema
const preferencesFormSchema = z.object({
  preferredCategories: z.array(z.number()).optional(),
  preferredStyles: z.array(z.string()).optional(),
  preferredPriceRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0)
  }).optional()
});

type PreferencesFormValues = z.infer<typeof preferencesFormSchema>;

export default function PreferencesForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    enabled: !!user
  });

  // Define form with default values
  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: {
      preferredCategories: user?.preferredCategories || [],
      preferredStyles: user?.preferredStyles || [],
      preferredPriceRange: user?.preferredPriceRange || { min: 0, max: 1000 }
    }
  });

  // Update form with user preferences when loaded
  useEffect(() => {
    if (user) {
      form.reset({
        preferredCategories: user.preferredCategories || [],
        preferredStyles: user.preferredStyles || [],
        preferredPriceRange: user.preferredPriceRange || { min: 0, max: 1000 }
      });

      // Update the price range slider
      if (user.preferredPriceRange) {
        setPriceRange([user.preferredPriceRange.min, user.preferredPriceRange.max]);
      }
    }
  }, [user, form]);

  // Function to handle price range changes from slider
  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
    form.setValue('preferredPriceRange', { min: values[0], max: values[1] });
  };

  // Mutation to update preferences
  const { isPending, mutate: updatePreferences } = useMutation({
    mutationFn: async (data: PreferencesFormValues) => {
      if (!user) throw new Error('User not authenticated');
      return apiRequest(`/api/users/${user.id}/preferences`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id] });
      toast({
        title: 'Preferences updated!',
        description: 'Your art preferences have been saved successfully.',
        variant: 'default'
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update preferences',
        description: 'There was an error saving your preferences. Please try again.',
        variant: 'destructive'
      });
      console.error('Preference update error:', error);
    }
  });

  // Art styles list
  const artStyles = [
    'Abstract', 'Realism', 'Impressionism', 'Expressionism', 
    'Surrealism', 'Minimalism', 'Pop Art', 'Digital Art',
    'Illustration', 'Concept Art', 'Comic Art', 'Anime/Manga'
  ];

  // Form submission handler
  const onSubmit = (data: PreferencesFormValues) => {
    // Ensure the price range is included
    const submissionData = {
      ...data,
      preferredPriceRange: {
        min: priceRange[0],
        max: priceRange[1]
      }
    };
    updatePreferences(submissionData);
  };

  // Format price for display
  const formatPrice = (value: number) => {
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className="py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Palette className="h-6 w-6 text-fuchsia-500" /> 
            <span className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-transparent bg-clip-text">Art Preferences</span>
          </CardTitle>
          <CardDescription>
            Tell us about your art preferences to get personalized recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Categories Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Art Categories</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="preferredCategories"
                    render={() => (
                      <FormItem className="col-span-full space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {categories.map((category) => (
                            <FormField
                              key={category.id}
                              control={form.control}
                              name="preferredCategories"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={category.id}
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(category.id)}
                                        onCheckedChange={(checked) => {
                                          const currentValue = field.value || [];
                                          return checked
                                            ? field.onChange([...currentValue, category.id])
                                            : field.onChange(
                                                currentValue.filter(
                                                  (value) => value !== category.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal cursor-pointer">
                                      {category.name}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                        <FormDescription>
                          Select the categories of art you're interested in
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Styles Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Art Styles</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="preferredStyles"
                    render={() => (
                      <FormItem className="col-span-full space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {artStyles.map((style) => (
                            <FormField
                              key={style}
                              control={form.control}
                              name="preferredStyles"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={style}
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(style)}
                                        onCheckedChange={(checked) => {
                                          const currentValue = field.value || [];
                                          return checked
                                            ? field.onChange([...currentValue, style])
                                            : field.onChange(
                                                currentValue.filter(
                                                  (value) => value !== style
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal cursor-pointer">
                                      {style}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                        <FormDescription>
                          Select the art styles you prefer
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Price Range Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Price Range</h3>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Min: {formatPrice(priceRange[0])}</span>
                      <span>Max: {formatPrice(priceRange[1])}</span>
                    </div>
                    <Slider
                      value={priceRange}
                      min={0}
                      max={5000}
                      step={50}
                      onValueChange={handlePriceRangeChange}
                      className="w-full"
                    />
                    <FormDescription>
                      Set your preferred price range for artwork
                    </FormDescription>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className="bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700"
                >
                  {isPending ? 'Saving...' : 'Save Preferences'}{' '}
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}