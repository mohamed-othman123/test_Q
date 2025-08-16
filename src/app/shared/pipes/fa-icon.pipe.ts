import {Pipe, PipeTransform} from '@angular/core';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import * as brandIcons from '@fortawesome/free-brands-svg-icons';
import {IconDefinition} from '@fortawesome/fontawesome-svg-core';

@Pipe({
  name: 'faIcon',
  standalone: false,
})
export class FaIconPipe implements PipeTransform {
  transform(iconClass: string | undefined): IconDefinition {
    if (!iconClass) return solidIcons.faQuestionCircle;

    try {
      const [prefix, name] = iconClass.split(' ');
      const cleanName = name.replace('fa-', '');
      const iconName = cleanName
        .split('-')
        .map((part, index) => {
          if (index === 0) return part;
          return part.charAt(0).toUpperCase() + part.slice(1);
        })
        .join('');

      const fullIconName = `fa${iconName.charAt(0).toUpperCase()}${iconName.slice(1)}`;

      const icon =
        prefix === 'fab'
          ? brandIcons[fullIconName as keyof typeof brandIcons]
          : solidIcons[fullIconName as keyof typeof solidIcons];

      return (icon as IconDefinition) || solidIcons.faQuestionCircle;
    } catch (error) {
      console.error('Error getting icon:', error);
      return solidIcons.faQuestionCircle;
    }
  }
}
