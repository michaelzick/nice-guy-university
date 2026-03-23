import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEOHead from '@/components/SEOHead';
import JsonLd from '@/components/JsonLd';
import HCaptcha, { HCaptchaHandle } from '@/components/HCaptcha';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from '@/lib/icons';
import { buildOrganizationSchema } from '@/lib/seo/schemas';
import { supabase } from '@/lib/supabase';

const contactSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required.'),
  lastName: z.string().trim().min(1, 'Last name is required.'),
  email: z.string().trim().email('Please enter a valid email.'),
  message: z.string().trim().min(1, 'Message is required.'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const hCaptchaSiteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY || import.meta.env.HCAPTCHA_SITE_KEY;

export default function ContactPage() {
  const { toast } = useToast();
  const captchaRef = useRef<HCaptchaHandle | null>(null);
  const [captchaToken, setCaptchaToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const captchaConfigured = Boolean(hCaptchaSiteKey?.trim());

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      message: '',
    },
    mode: 'onChange',
  });

  const handleSubmit = async (values: ContactFormValues) => {
    if (!captchaConfigured || !captchaToken) {
      toast({
        title: 'Complete hCaptcha',
        description: 'Please complete the captcha before sending your message.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          message: values.message,
          captchaToken,
        },
      });

      if (error) {
        throw error;
      }

      if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
        throw new Error(data.error);
      }

      toast({
        title: 'Message sent',
        description: "Your note is on its way. We'll get back to you soon.",
      });

      form.reset();
      setCaptchaToken('');
      captchaRef.current?.reset();
    } catch (error) {
      toast({
        title: 'Unable to send message',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitDisabled = isSubmitting || !captchaConfigured || !captchaToken || !form.formState.isValid;

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead
        title="Contact"
        description="Contact Nice Guy University with questions about the platform, courses, or your next step."
        canonicalPath="/contact"
      />
      <JsonLd data={buildOrganizationSchema()} />
      <Navbar />

      <main className="page-pattern-surface-muted flex-grow mobile-shell pb-16 pt-32">
        <div className="container mx-auto max-w-5xl content-stack">
          <div className="mb-10 max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-foreground">Contact</p>
            <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              Reach out when you're ready to talk.
            </h1>
            <p className="text-lg text-muted-foreground">
              Questions about the platform, a course, or where to start? Send a message and we’ll point you in the right direction.
            </p>
          </div>

          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Send a message</CardTitle>
              <CardDescription>
                Fill out the form below and complete hCaptcha before submitting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} autoComplete="given-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} autoComplete="family-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" autoComplete="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            className="min-h-[180px]"
                            placeholder="Tell us what you need help with."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">hCaptcha</p>
                    <HCaptcha
                      ref={captchaRef}
                      siteKey={hCaptchaSiteKey}
                      onVerify={setCaptchaToken}
                    />
                    {captchaConfigured && !captchaToken && (
                      <p className="text-sm text-muted-foreground">
                        Complete the captcha to enable submit.
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitDisabled}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send Message
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
