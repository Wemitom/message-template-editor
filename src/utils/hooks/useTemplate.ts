import { useContext } from 'react';

import { TemplateContext } from '../../components/Editor';

export default function useTemplate() {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error(`useTemplate must be used within a TemplateProvider`);
  }
  return context;
}
