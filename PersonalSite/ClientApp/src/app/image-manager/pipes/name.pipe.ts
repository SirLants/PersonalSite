import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'name' })
export class NamePipe implements PipeTransform {
  transform(name: Array<string>): string {
    if (name[0] && name[0].length && name[0].trim().length > 0) {
      if (name[1] && name[1].length && name[1].trim().length > 0) {
        return name[0] + ' ' + name[1];
      } else {
        return name[0];
      }
    } else {
      return '';
    }
  }
}
