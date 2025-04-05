
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Copy, Link2, Mail, Users, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export const ShareDialog = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("link");
  const [shareLink, setShareLink] = useState("https://cubable.io/share/abc123");
  const [permission, setPermission] = useState("view");
  const [expiresIn, setExpiresIn] = useState("never");
  const [emails, setEmails] = useState("");
  const [isPublicAccess, setIsPublicAccess] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Link copied",
      description: "Share link has been copied to clipboard",
    });
  };

  const handleInvite = () => {
    if (!emails.trim()) {
      toast({
        title: "No emails provided",
        description: "Please enter at least one email address",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Invitation sent",
      description: "Collaborators have been notified by email",
    });
    onOpenChange(false);
  };

  const handlePublicShare = () => {
    toast({
      title: "Public sharing updated",
      description: isPublicAccess ? "Your model is now publicly accessible" : "Public access has been disabled",
    });
  };

  const handleCheckboxChange = (checked) => {
    setIsPublicAccess(checked === true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Model</DialogTitle>
          <DialogDescription>
            Share your database model with others
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="link" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="link" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Link
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="public" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Public
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="link" className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="shareLink">Share link</Label>
                <Input
                  id="shareLink"
                  value={shareLink}
                  readOnly
                  className="h-9"
                />
              </div>
              <Button
                type="button"
                size="sm"
                className="px-3 mt-6"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="permission">Permission</Label>
                <Select value={permission} onValueChange={setPermission}>
                  <SelectTrigger id="permission" className="h-9 mt-1">
                    <SelectValue placeholder="Select permission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View only</SelectItem>
                    <SelectItem value="comment">Can comment</SelectItem>
                    <SelectItem value="edit">Can edit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="expires">Expires in</Label>
                <Select value={expiresIn} onValueChange={setExpiresIn}>
                  <SelectTrigger id="expires" className="h-9 mt-1">
                    <SelectValue placeholder="Select expiration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="1day">1 day</SelectItem>
                    <SelectItem value="7days">7 days</SelectItem>
                    <SelectItem value="30days">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="email" className="space-y-4">
            <div>
              <Label htmlFor="emails">Email addresses</Label>
              <Input
                id="emails"
                placeholder="name@company.com, name@company.com"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                className="h-9 mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separate multiple emails with commas
              </p>
            </div>
            
            <div>
              <Label htmlFor="emailPermission">Permission</Label>
              <Select value={permission} onValueChange={setPermission}>
                <SelectTrigger id="emailPermission" className="h-9 mt-1">
                  <SelectValue placeholder="Select permission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View only</SelectItem>
                  <SelectItem value="comment">Can comment</SelectItem>
                  <SelectItem value="edit">Can edit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="public" className="space-y-4">
            <div className="flex items-start space-x-3 pt-2">
              <Checkbox
                id="public-access"
                checked={isPublicAccess}
                onCheckedChange={handleCheckboxChange}
              />
              <div className="grid gap-1.5">
                <Label
                  htmlFor="public-access"
                  className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Enable public access
                </Label>
                <p className="text-sm text-muted-foreground">
                  Anyone with the link can view this model without signing in
                </p>
              </div>
            </div>
            
            {isPublicAccess && (
              <div className="grid gap-2">
                <Label htmlFor="publicPermission">Permission level</Label>
                <Select value={permission} onValueChange={setPermission}>
                  <SelectTrigger id="publicPermission" className="h-9">
                    <SelectValue placeholder="Select permission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View only</SelectItem>
                    <SelectItem value="comment">Can comment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={activeTab === "email" ? handleInvite : handlePublicShare}>
            {activeTab === "link" ? "Copy & Close" : 
             activeTab === "email" ? "Invite" : 
             "Apply & Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
