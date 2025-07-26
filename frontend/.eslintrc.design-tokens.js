module.exports = {
  rules: {
    // Custom rule to prevent hardcoded hex colors
    'no-hardcoded-colors': {
      create(context) {
        return {
          Literal(node) {
            if (typeof node.value === 'string') {
              // Check for hex colors
              const hexColorRegex = /#[0-9a-fA-F]{3,8}/g;
              if (hexColorRegex.test(node.value)) {
                context.report({
                  node,
                  message: `Avoid hardcoded hex color "${node.value}". Use design tokens instead (e.g., className="text-accent").`
                });
              }
            }
          },
          Property(node) {
            // Check for inline styles with hardcoded values
            if (node.key && node.key.name === 'style' && node.value.type === 'ObjectExpression') {
              node.value.properties.forEach(prop => {
                if (prop.key && prop.value) {
                  const propertyName = prop.key.name || prop.key.value;
                  const propertyValue = prop.value.value;
                  
                  // Check for hardcoded font sizes
                  if (propertyName === 'fontSize' && typeof propertyValue === 'string') {
                    context.report({
                      node: prop,
                      message: `Avoid hardcoded fontSize "${propertyValue}". Use design tokens instead (e.g., className="text-body-large").`
                    });
                  }
                  
                  // Check for hardcoded colors
                  if ((propertyName === 'color' || propertyName === 'backgroundColor') && typeof propertyValue === 'string') {
                    if (propertyValue.includes('#') || propertyValue.includes('rgb')) {
                      context.report({
                        node: prop,
                        message: `Avoid hardcoded color "${propertyValue}". Use design tokens instead (e.g., className="text-accent").`
                      });
                    }
                  }
                  
                  // Check for hardcoded padding/margin
                  if ((propertyName.includes('padding') || propertyName.includes('margin')) && typeof propertyValue === 'string') {
                    if (/\d+px/.test(propertyValue)) {
                      context.report({
                        node: prop,
                        message: `Avoid hardcoded spacing "${propertyValue}". Use design tokens instead (e.g., className="p-md").`
                      });
                    }
                  }
                }
              });
            }
          }
        };
      }
    },
    
    // Rule to encourage using our component classes
    'prefer-design-classes': {
      create(context) {
        return {
          JSXAttribute(node) {
            if (node.name && node.name.name === 'className' && node.value) {
              const className = node.value.value;
              if (typeof className === 'string') {
                // Warn about deprecated App.css classes
                const deprecatedClasses = [
                  'HeroTitle', 'HeroSubtitle', 'HeroCopy', 'HeroCTA',
                  'FeatureCard', 'FeatureTitle', 'FeatureDescription',
                  'StageTag', 'StageTitle', 'StageRole', 'StageMotto',
                  'StatCard', 'StatLabel', 'StatValue',
                  'AccordionCard', 'AccordionHeader', 'DomainBadge', 'PriorityPill'
                ];
                
                deprecatedClasses.forEach(deprecatedClass => {
                  if (className.includes(deprecatedClass)) {
                    context.report({
                      node,
                      message: `Class "${deprecatedClass}" is deprecated. Use design token classes instead (see DESIGN_SYSTEM_MIGRATION.md).`
                    });
                  }
                });
              }
            }
          }
        };
      }
    }
  }
};

// Usage instructions:
// Add to your .eslintrc.js:
// {
//   "extends": ["./.eslintrc.design-tokens.js"],
//   "rules": {
//     "no-hardcoded-colors": "warn",
//     "prefer-design-classes": "warn"
//   }
// }