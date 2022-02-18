class CreateSlideTemplates < ActiveRecord::Migration[7.0]
  def change
    create_table :slide_templates do |t|
      t.references :organisation, null: false, foreign_key: true
      t.string :name
      t.text :content
      t.boolean :enabled

      t.timestamps
    end
  end
end
