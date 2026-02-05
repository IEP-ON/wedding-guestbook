export function numberToKorean(number: number): string {
  if (number === 0) return '영원';
  
  const units = ['', '만', '억', '조'];
  const nums = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  
  let result = '';
  let unitIndex = 0;
  let currentNum = number;
  
  while (currentNum > 0) {
    const part = currentNum % 10000;
    
    if (part > 0) {
      let partStr = '';
      const partStrNum = part.toString();
      
      for (let i = 0; i < partStrNum.length; i++) {
        const n = parseInt(partStrNum[partStrNum.length - 1 - i]);
        const digit = i; // 0: 1, 1: 10, 2: 100, 3: 1000
        
        if (n > 0) {
          const numStr = nums[n];
          const digitStr = ['', '십', '백', '천'][digit];
          partStr = numStr + digitStr + partStr;
        }
      }
      
      result = partStr + units[unitIndex] + result;
    }
    
    currentNum = Math.floor(currentNum / 10000);
    unitIndex++;
  }
  
  return `일금 ${result}원정`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount);
}
