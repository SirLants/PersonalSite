import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'andString'
})
export class AndStringPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    let result = '';
    let count = 0;

    value.forEach((item: string) => {
      count += 1;
      if (item && count) { // adding count somehow resolves an optimization issue in prod (we think)
        if (result !== '') {
          result += (count === value.length) ? ' and ' : ', ';
        }

        result += item.trim();
      }
    });

    return result;
  }
}
