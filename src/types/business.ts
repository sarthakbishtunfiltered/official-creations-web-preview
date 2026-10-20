export type ImageAsset = { name: string; type: string; dataUrl: string };
export type Service = { name: string; description: string; startingPrice: string; image?: ImageAsset };
export type Project = { title: string; type: string; image?: ImageAsset };
export type Testimonial = { customerName: string; text: string; avatar?: ImageAsset };
export type Faq = { question: string; answer: string };
export type BusinessData = {
  industry: string; template: "simple" | "premium"; businessName: string; ownerName: string;
  phone: string; whatsapp: string; email: string; city: string; address: string; mapsLink: string;
  logo?: ImageAsset; brandColor: string; secondaryBrandColor: string; tagline: string; about: string;
  heroImage?: ImageAsset; aboutImage?: ImageAsset; ownerPhoto?: ImageAsset; yearsExperience: string;
  projectTypes: string; services: Service[]; projects: Project[]; testimonials: Testimonial[]; faqs: Faq[];
  socialLinks: { instagram: string; facebook: string; linkedin: string }; enquiryForm: boolean;
};
