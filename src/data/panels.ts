export type PanelDefinition = {
  id: number;
  title: string;
  image: string;
};

export const panels = [
  { id: 1, title: 'Furniture', image: '/panels/01-furniture.webp' },
  { id: 2, title: 'Recipe', image: '/panels/02-recipe.webp' },
  { id: 3, title: 'Directions', image: '/panels/03-directions.webp' },
  { id: 4, title: 'Presentation', image: '/panels/04-presentation.webp' },
  { id: 5, title: 'Guitar', image: '/panels/05-guitar.webp' },
  { id: 6, title: 'Meeting', image: '/panels/06-meeting.webp' },
  { id: 7, title: 'Phone number', image: '/panels/07-phone-number.webp' },
  { id: 8, title: 'Trip', image: '/panels/08-trip.webp' },
  { id: 9, title: 'New app', image: '/panels/09-new-app.webp' },
  { id: 10, title: 'Names', image: '/panels/10-names.webp' },
  { id: 11, title: 'Dinner', image: '/panels/11-dinner.webp' },
  { id: 12, title: 'Complaint', image: '/panels/12-complaint.webp' },
  { id: 13, title: 'Unwind', image: '/panels/13-unwind.webp' },
  { id: 14, title: 'Results', image: '/panels/14-results.webp' },
] as const satisfies readonly PanelDefinition[];
