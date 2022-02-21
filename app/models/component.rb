class Component < ApplicationRecord

  validates_presence_of :name, on: [:update, :create], message: "can't be blank"
  
  has_many :master_slide_template_components
  has_many :master_slide_template, through: :master_slide_template_components

  
  has_many :slide_template_components
  has_many :slide_template, through: :slide_template_components


end
