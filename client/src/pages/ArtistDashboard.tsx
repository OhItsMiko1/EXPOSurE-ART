import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/local-auth";
import { Artwork, Commission } from "@/lib/types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  UploadCloud,
  Edit,
  Trash,
  AlertCircle,
  Check,
  X,
  Clock
} from "lucide-react";

export default function ArtistDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [artworkToDelete, setArtworkToDelete] = useState<Artwork | null>(null);
  
  // Redirect if not logged in or not an artist
  if (!user) {
    navigate("/login");
    return null;
  }
  
  if (!user.isArtist) {
    navigate("/");
    return null;
  }
  
  // Fetch artist's artworks
  const { data: artworks, isLoading: isLoadingArtworks } = useQuery<Artwork[]>({
    queryKey: [`/api/artworks?artistId=${user.id}`],
  });

  // Fetch artist's commissions
  const { data: commissions, isLoading: isLoadingCommissions } = useQuery<Commission[]>({
    queryKey: [`/api/commissions?artistId=${user.id}`],
  });
  
  // Delete artwork mutation
  const deleteArtworkMutation = useMutation({
    mutationFn: async (artworkId: number) => {
      await apiRequest("DELETE", `/api/artworks/${artworkId}`, undefined);
    },
    onSuccess: () => {
      toast({
        title: "Artwork Deleted",
        description: "Your artwork has been successfully deleted.",
      });
      
      queryClient.invalidateQueries({
        predicate: (query) => typeof query.queryKey[0] === 'string' && query.queryKey[0].startsWith('/api/artworks'),
      });
      setArtworkToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete artwork",
        variant: "destructive",
      });
    },
  });
  
  // Update commission status mutation
  const updateCommissionStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/commissions/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Commission status has been updated successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/commissions'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update commission status",
        variant: "destructive",
      });
    },
  });
  
  // Status badge colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">In Progress</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Artist Dashboard</h1>
          <p className="text-gray-600">Manage your artwork and commissions</p>
        </div>
        
        <Button asChild>
          <a href="/upload">
            <UploadCloud className="mr-2 h-5 w-5" />
            Upload New Artwork
          </a>
        </Button>
      </div>
      
      <Tabs defaultValue="artworks">
        <TabsList className="w-full">
          <TabsTrigger value="artworks" className="flex-1">My Artworks</TabsTrigger>
          <TabsTrigger value="commissions" className="flex-1">Commission Requests</TabsTrigger>
          <TabsTrigger value="sales" className="flex-1">Sales</TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1">Analytics</TabsTrigger>
        </TabsList>
        
        {/* Artworks Tab */}
        <TabsContent value="artworks">
          {isLoadingArtworks ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-40 w-full" />
                  <CardHeader>
                    <Skeleton className="h-5 w-2/3 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : artworks && artworks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {artworks.map(artwork => (
                <Card key={artwork.id}>
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={artwork.imageUrl} 
                      alt={artwork.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="truncate">{artwork.title}</CardTitle>
                    <CardDescription className="flex justify-between">
                      <span>${artwork.price.toFixed(2)}</span>
                      <span>{artwork.forSale ? "For Sale" : "Not for Sale"}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex gap-2">
                    <Button variant="default" className="flex-1" asChild>
                      <a href={`/edit-artwork/${artwork.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </a>
                    </Button>
                    <Button variant="outline" className="flex-1" asChild>
                      <a href={`/artwork/${artwork.id}`}>View</a>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-600 hover:text-red-600 hover:bg-red-50 shrink-0"
                      onClick={() => setArtworkToDelete(artwork)}
                      aria-label="Delete artwork"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>No Artworks Yet</CardTitle>
                <CardDescription>You haven't uploaded any artworks yet.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Start building your portfolio by uploading your first artwork. This will help you attract buyers and commission requests.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <a href="/upload">
                    <UploadCloud className="mr-2 h-5 w-5" />
                    Upload Your First Artwork
                  </a>
                </Button>
              </CardFooter>
            </Card>
          )}
          
          {/* Delete Artwork Confirmation Dialog */}
          <Dialog open={!!artworkToDelete} onOpenChange={(open) => !open && setArtworkToDelete(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Artwork</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{artworkToDelete?.title}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setArtworkToDelete(null)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => artworkToDelete && deleteArtworkMutation.mutate(artworkToDelete.id)}
                  disabled={deleteArtworkMutation.isPending}
                >
                  {deleteArtworkMutation.isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        {/* Commissions Tab */}
        <TabsContent value="commissions">
          {isLoadingCommissions ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/3 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ) : commissions && commissions.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Commission Requests</CardTitle>
                <CardDescription>Manage your incoming commission requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {commissions.map(commission => (
                      <TableRow key={commission.id}>
                        <TableCell className="font-medium">{commission.title}</TableCell>
                        <TableCell>
                          {commission.buyerName || `Client #${commission.buyerId}`}
                        </TableCell>
                        <TableCell>
                          {commission.budget ? `$${commission.budget.toFixed(2)}` : "Not specified"}
                        </TableCell>
                        <TableCell>
                          {new Date(commission.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(commission.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">View Details</Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Commission Details</DialogTitle>
                                <DialogDescription>
                                  Commission request from Client #{commission.buyerId}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <span className="font-medium text-gray-500">Title:</span>
                                  <span className="col-span-3">{commission.title}</span>
                                </div>
                                <div className="grid grid-cols-4 items-start gap-4">
                                  <span className="font-medium text-gray-500">Description:</span>
                                  <div className="col-span-3">
                                    <p className="text-gray-700">{commission.description}</p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <span className="font-medium text-gray-500">Budget:</span>
                                  <span className="col-span-3">
                                    {commission.budget ? `$${commission.budget.toFixed(2)}` : "Not specified"}
                                  </span>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <span className="font-medium text-gray-500">Status:</span>
                                  <span className="col-span-3">
                                    {getStatusBadge(commission.status)}
                                  </span>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <span className="font-medium text-gray-500">Date Requested:</span>
                                  <span className="col-span-3">
                                    {new Date(commission.createdAt).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              
                              <DialogFooter>
                                {commission.status === "pending" && (
                                  <div className="flex space-x-2">
                                    <Button 
                                      onClick={() => updateCommissionStatusMutation.mutate({
                                        id: commission.id,
                                        status: "in_progress"
                                      })}
                                      disabled={updateCommissionStatusMutation.isPending}
                                    >
                                      <Check className="mr-2 h-4 w-4" />
                                      Accept Commission
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      onClick={() => updateCommissionStatusMutation.mutate({
                                        id: commission.id,
                                        status: "cancelled"
                                      })}
                                      disabled={updateCommissionStatusMutation.isPending}
                                    >
                                      <X className="mr-2 h-4 w-4" />
                                      Decline
                                    </Button>
                                  </div>
                                )}
                                
                                {commission.status === "in_progress" && (
                                  <Button 
                                    onClick={() => updateCommissionStatusMutation.mutate({
                                      id: commission.id,
                                      status: "completed"
                                    })}
                                    disabled={updateCommissionStatusMutation.isPending}
                                  >
                                    <Check className="mr-2 h-4 w-4" />
                                    Mark as Completed
                                  </Button>
                                )}
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>No Commission Requests</CardTitle>
                <CardDescription>You haven't received any commission requests yet.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Commission requests will appear here when clients are interested in your work. 
                  Keep uploading your artwork to attract potential clients.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Sales Tab */}
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Information</CardTitle>
              <CardDescription>Track your artwork sales</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-10">
              <Clock className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">Coming Soon</h3>
              <p className="text-gray-500 text-center max-w-md">
                Sales tracking and management features will be available in the next update.
                Check back soon!
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Track your profile and artwork performance</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-10">
              <Clock className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">Coming Soon</h3>
              <p className="text-gray-500 text-center max-w-md">
                Analytics features will be available in the next update.
                You'll be able to track views, likes, and engagement with your artwork.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
