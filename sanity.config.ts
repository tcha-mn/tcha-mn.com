// sanity.config.ts
import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';

export default defineConfig({
  name: 'project-name',
  title: 'Project Name',
  projectId: 'fzxx7ejh',
  dataset: 'production',
  plugins: [deskTool()],
  schema: {
    types: [
      /* your content types here*/
    ],
  },
});
