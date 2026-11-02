// The real proof shown on the visitor page. Fill in only what is true: a section on the page
// appears once it has at least one entry, and stays hidden while it is empty.
//
// Images: put the picture files in the "public" folder and write their path here, for
// example "/samples/sunrise.webp", or paste a full image link.

export interface Sample {
  // What the website is, e.g. "Sunrise Interiors"
  title: string;
  // The kind of business, e.g. "Interior designer"
  niche: string;
  // A screenshot of the website
  image: string;
  // Optional: a link that opens the live website or a preview of it
  href?: string;
}

export interface Testimonial {
  // What the client said, in their words
  quote: string;
  // The client's name
  name: string;
  // Their business, e.g. "Sunrise Interiors, Ahmedabad"
  business: string;
}

export interface Package {
  // e.g. "Starter"
  name: string;
  // As you want it shown, e.g. "₹9,999"
  price: string;
  // What is included, one short line each
  points: string[];
}

export const proof: {
  samples: Sample[];
  testimonials: Testimonial[];
  packages: Package[];
  // How long a sample or a website takes, in words, e.g. "within 2 days". Leave "" to say nothing.
  deliveryTime: string;
} = {
  samples: [],
  testimonials: [],
  packages: [],
  deliveryTime: "",
};
