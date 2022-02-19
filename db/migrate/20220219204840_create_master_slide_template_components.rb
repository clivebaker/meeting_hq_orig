class CreateMasterSlideTemplateComponents < ActiveRecord::Migration[7.0]
  def change
    create_table :master_slide_template_components do |t|
      t.references :master_slide_template, null: false, foreign_key: true, index: false
      t.references :component, null: false, foreign_key: true
      t.integer :top, default: 0
      t.integer :left, default: 0
      t.integer :width, default: 200
      t.integer :height, default: 30
      t.jsonb :settings, default: {}

      t.timestamps
    end

    add_index :master_slide_template_components, :master_slide_template_id, name: 'mstc_template_id'

  end
end
