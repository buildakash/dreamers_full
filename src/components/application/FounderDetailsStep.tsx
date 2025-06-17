
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface FounderDetailsStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
}

const FounderDetailsStep = ({ data, updateData, onNext }: FounderDetailsStepProps) => {
  const handleInputChange = (field: string, value: string) => {
    updateData({ [field]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const requiredFields = ['founderName', 'startupName', 'email', 'phone', 'companyType', 'teamSize', 'source', 'couponCode'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    console.log('Step 1 data:', data);
    onNext();
  };

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900">Founder & Startup Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="founderName" className="text-gray-700">Founder Name *</Label>
              <Input
                id="founderName"
                value={data.founderName || ''}
                onChange={(e) => handleInputChange('founderName', e.target.value)}
                className="border-gray-300"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startupName" className="text-gray-700">Startup Name *</Label>
              <Input
                id="startupName"
                value={data.startupName || ''}
                onChange={(e) => handleInputChange('startupName', e.target.value)}
                className="border-gray-300"
                placeholder="Enter your startup name"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={data.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="border-gray-300"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-700">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={data.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="border-gray-300"
                placeholder="Enter your phone number"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700">Company Type *</Label>
              <Select value={data.companyType || ''} onValueChange={(value) => handleInputChange('companyType', value)}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MSME">MSME</SelectItem>
                  <SelectItem value="Pvt Ltd">Pvt Ltd</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Team Size *</Label>
              <Select value={data.teamSize || ''} onValueChange={(value) => handleInputChange('teamSize', value)}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Member</SelectItem>
                  <SelectItem value="2-5">2-5 Members</SelectItem>
                  <SelectItem value="6-10">6-10 Members</SelectItem>
                  <SelectItem value="10+">10+ Members</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">How did you hear about us? *</Label>
              <Select value={data.source || ''} onValueChange={(value) => handleInputChange('source', value)}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Social Media">Social Media</SelectItem>
                  <SelectItem value="Friend/Referral">Friend/Referral</SelectItem>
                  <SelectItem value="Event">Event</SelectItem>
                  <SelectItem value="Website">Website</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="couponCode" className="text-gray-700">Coupon Code *</Label>
            <Input
              id="couponCode"
              value={data.couponCode || ''}
              onChange={(e) => handleInputChange('couponCode', e.target.value)}
              className="border-gray-300"
              placeholder="Enter your coupon code"
              required
            />
            <p className="text-sm text-gray-500">This code is required to access the incubation program</p>
          </div>

          <div className="flex justify-end">
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

export default FounderDetailsStep;
