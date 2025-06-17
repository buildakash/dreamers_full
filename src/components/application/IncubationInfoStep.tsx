
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface IncubationCenter {
  id: string;
  name: string;
  admin_email: string;
}

interface IncubationInfoStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const IncubationInfoStep = ({ data, updateData, onNext, onPrev }: IncubationInfoStepProps) => {
  const [incubationCenters, setIncubationCenters] = useState<IncubationCenter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncubationCenters();
  }, []);

  const fetchIncubationCenters = async () => {
    try {
      const { data: centers, error } = await supabase
        .from('incubation_centres')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching incubation centers:', error);
        toast({
          title: "Error",
          description: "Failed to load incubation centers",
          variant: "destructive",
        });
        return;
      }

      setIncubationCenters(centers || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error", 
        description: "Failed to load incubation centers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    updateData({ [field]: value });
  };

  const handleFileChange = (field: string, file: File | null) => {
    updateData({ [field]: file });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!data.incubationCentre) {
      toast({
        title: "Missing Information",
        description: "Please select an incubation centre",
        variant: "destructive",
      });
      return;
    }

    console.log('Step 2 data:', data);
    onNext();
  };

  if (loading) {
    return (
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading incubation centers...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900">Incubation Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-gray-700">Select Incubation Centre *</Label>
            <Select value={data.incubationCentre || ''} onValueChange={(value) => handleInputChange('incubationCentre', value)}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Choose your preferred incubation centre" />
              </SelectTrigger>
              <SelectContent>
                {incubationCenters.map((center) => (
                  <SelectItem key={center.id} value={center.name}>
                    {center.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="registrationCertificate" className="text-gray-700">Registration Certificate *</Label>
              <Input
                id="registrationCertificate"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange('registrationCertificate', e.target.files?.[0] || null)}
                className="border-gray-300"
                required
              />
              <p className="text-sm text-gray-500">PDF, JPG, or PNG format (Max 5MB)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="incubationLetter" className="text-gray-700">Incubation Letter (Optional)</Label>
              <Input
                id="incubationLetter"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange('incubationLetter', e.target.files?.[0] || null)}
                className="border-gray-300"
              />
              <p className="text-sm text-gray-500">If available from previous incubations</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className="text-gray-700">Website / Social Profile (Optional)</Label>
            <Input
              id="website"
              type="url"
              value={data.website || ''}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="border-gray-300"
              placeholder="https://your-website.com or social media profile"
            />
            <p className="text-sm text-gray-500">Your website, LinkedIn, or any relevant online presence</p>
          </div>

          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onPrev}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8"
            >
              Previous
            </Button>
            <Button 
              type="submit" 
              className="bg-gray-900 hover:bg-gray-800 text-white px-8"
            >
              Next Step
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default IncubationInfoStep;
