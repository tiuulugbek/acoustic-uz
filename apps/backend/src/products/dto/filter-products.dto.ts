import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterProductsDto {
  @ApiPropertyOptional({ description: 'Mahsulot holati' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Brend ID' })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Kategoriya ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Katalog ID' })
  @IsOptional()
  @IsString()
  catalogId?: string;

  @ApiPropertyOptional({ description: 'Mahsulot turi' })
  @IsOptional()
  @IsString()
  productType?: string;

  @ApiPropertyOptional({ description: 'Qidiruv so\'rovi' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Auditoriya' })
  @IsOptional()
  @IsString()
  audience?: string;

  @ApiPropertyOptional({ description: 'Korpus turi' })
  @IsOptional()
  @IsString()
  formFactor?: string;

  @ApiPropertyOptional({ description: 'Signal qayta ishlash' })
  @IsOptional()
  @IsString()
  signalProcessing?: string;

  @ApiPropertyOptional({ description: 'Quvvat darajasi' })
  @IsOptional()
  @IsString()
  powerLevel?: string;

  @ApiPropertyOptional({ description: 'Eshitish yo\'qotish darajasi' })
  @IsOptional()
  @IsString()
  hearingLossLevel?: string;

  @ApiPropertyOptional({ description: 'Smartfon mosligi' })
  @IsOptional()
  @IsString()
  smartphoneCompatibility?: string;

  @ApiPropertyOptional({ description: 'To\'lov usuli' })
  @IsOptional()
  @IsString()
  paymentOption?: string;

  @ApiPropertyOptional({ description: 'Mavjudlik holati' })
  @IsOptional()
  @IsString()
  availabilityStatus?: string;

  @ApiPropertyOptional({ description: 'Sahifadagi mahsulotlar soni', default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: 'O\'tkazib yuborilgan mahsulotlar soni', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ description: 'Tartiblash', enum: ['newest', 'price_asc', 'price_desc'], default: 'newest' })
  @IsOptional()
  @IsEnum(['newest', 'price_asc', 'price_desc'])
  sort?: 'newest' | 'price_asc' | 'price_desc';
}




