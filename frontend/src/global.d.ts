declare module 'nigeria-languages' {
  const languages: Array<{
    name: string;
    code?: string;
    otherNames?: string[];
    type: string;
    info: string;
  }>;
  export default languages;
}
