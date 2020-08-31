import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'plurality' })
export class PluralityPipe implements PipeTransform {
  transform(count: number): string {
    if (count > 1) {
      return 's';
    } else {
      return '';
    }
  }

  smarterTransform(stringValue: string, arrayValue: Array<any>): string {
    if (arrayValue && arrayValue.length) {
      if (arrayValue.length > 1) {
        switch (stringValue[stringValue.length - 1]) {
          case 'y':
            return `${stringValue.substr(0, stringValue.length - 1)}ies`;
          default:
            return `${stringValue}s`;
        }
      }
    }
    else {
      return stringValue;
    }
  }
}
