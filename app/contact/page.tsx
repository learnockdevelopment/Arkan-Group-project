"use client"
import { Card ,CardHeader ,CardTitle ,CardContent  } from "@/components/ui/card";
import { Label } from '@/components/ui/label'
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
function page() {
     const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", form);
    // 🔹 You can connect this to your API / backend here
  };
  return (
    <section className="py-16">
      <div className="lg:min-w-7xl mx-auto mt-16 mb-12">
        <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-center mb-8">
          Contact us
        </h1>
        <p className="text-base text-[#656565] text-center">
          We are here to answer all your questions and help you make the best
          decision for your children's educational future.
        </p>
      </div>
<div className="px-6">
      <div className="max-w-5xl mx-auto border rounded-xl ">
      <div className=" px-4 my-16">
       
        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-black text-xl lg:text-2xl">Send us a Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="flex gap-6 mb-6 lg:flex-row flex-col">
              <div className="space-y-2 flex-1">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Omnia Magdy"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="px-3 py-5 bg-[#F6F6F6]"
                />
              </div>

              {/* Email */}
              <div className="space-y-2 flex-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="OmniaMagdy@gmail.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="px-3 py-5 bg-[#F6F6F6]"
                />
              </div>
              </div>

              {/* Subject */}
              <div className="space-y-2 mb-6">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="ex; issue with booking 123458"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className="px-3 py-5 bg-[#F6F6F6]"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Please describe your issue in detail..."
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  required
                  className="px-3 py-5 bg-[#F6F6F6]"
                />
              </div>

              {/* Submit */}
              <div className="flex justify-center mt-12">
                <Button
                  type="submit"
                  className="bg-[#1A4973]  text-white w-full !rounded-full p-6 text-lg"
                >
                  Send Message
                                   

                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      </div>
      </div>
    </section>
  );
}

export default page;
