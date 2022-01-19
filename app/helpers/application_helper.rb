module ApplicationHelper



  def nav_active?(controller)

    "active" if params[:controller] == controller

  end
  

  def nav_includes?(controllers) 
    
    ret = {collapse: 'collapse', active: ''}
    
    ret = {collapse: '', active: 'active'} if controllers.include?(params[:controller])

    ret

  end
  


  
end
