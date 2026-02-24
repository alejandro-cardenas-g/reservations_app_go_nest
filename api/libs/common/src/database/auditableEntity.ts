import { BeforeInsert, CreateDateColumn } from 'typeorm';

export class AuditableEntity {
  @CreateDateColumn({
    name: 'created_at',
    nullable: false,
  })
  createdAt: Date;

  @BeforeInsert()
  beforeInsert() {
    this.createdAt = new Date();
  }
}
